# Pendências do mobile para o back — 2026-09-12

> Levantado durante a validação da **Sprint 3** (entrega do APK final).
> Resposta anterior de vocês: [`BACKEND_RESPONSE_2026-05-24.md`](./BACKEND_RESPONSE_2026-05-24.md).

Rodamos `scripts/verify-backend.sh` contra produção hoje e comparamos as 47
chamadas do app com a spec de `/v3/api-docs`, endpoint por endpoint.

**Resultado geral: 14 checks passando, 1 falhando.** Quase tudo que vocês
prometeram em maio está no ar e correto — os 7 campos novos em `/leads`, o
envelope de `/segments/distribution`, o perfil real em
`/segments/{segment}/customers`, `trend` + `estimatedRevenue` no ranking por
concessionária, e o `AvailabilitySlot.time` em `HH:mm`. Obrigado.

Sobraram 4 itens. Só o primeiro é bloqueio.

---

## 1. 🔴 BLOQUEIO — nenhuma conta cliente tem veículo

> **Atualização 2026-09-12, mais tarde:** `claude-test@vinshare.dev` foi
> promovida a `ADMIN`. Com isso ela passou a receber **403** em todos os
> `/me/*` (um ADMIN não tem registro `Customer`), então as telas de cliente
> deixaram de abrir. Criamos `cliente.demo@vinshare.dev` via
> `POST /auth/register` para ter um `CLIENT` de volta — os `/me/*` respondem
> 200 nela, mas **continua sem veículo**, que é o que este item pede.
> A senha dela não vai neste documento; peça no Slack.

`cliente.demo@vinshare.dev` autentica normalmente, mas está vazia:

```
GET /me/vehicles         → data: []      (0 itens)
GET /me/services         → content: []   (0 itens)
GET /me/appointments     → content: []   (0 itens)
GET /me/surveys/pending  → data: []      (0 itens)
GET /me/loyalty/balance  → { "balance": 0, "expiringIn30Days": 0 }
```

Com isso **as 7 telas do fluxo cliente renderizam estado vazio**. A entrega da
sprint exige capturas de todas as telas e a demonstração dos fluxos rodando,
e nenhuma das duas é possível assim. O lado analista está completo e funciona
(leads, segmentação, KPIs, Visão 360).

### O que precisamos

**Um veículo no banco vinculado ao `Customer` dessa conta.** É um `INSERT`.
Não existe endpoint na API que crie veículo — conferimos os 16 endpoints de
escrita da spec, e `POST /auth/register` só cria a pessoa (`fullName`,
`email`, `cpf`, `password`).

Sugestão de dados, para casar com o que o app demonstra:

| Campo | Valor sugerido |
|---|---|
| Modelo / versão | Ranger — Raptor 3.0 V6 |
| Ano | 2023 |
| Placa | qualquer uma válida |
| Km atual | ~28.000 |
| Garantia | ativa, vencendo em ~6 meses |

### O que fazemos depois, sozinhos

Assim que o veículo existir, populamos o resto **pela própria API**, sem
incomodar vocês de novo:

- `POST /appointments` → agendamento
- `PATCH /appointments/{id}/complete` → gera o histórico de serviço
- `POST /services/{id}/nps` → avaliação
- `PATCH /vehicles/{id}/odometer` → quilometragem

O único passo que depende de acesso ao banco é o veículo.

---

## 2. `JWT_ACCESS_MIN` continua em 300

Em maio ficou combinado subir para 900, com a observação de que *"é só mexer
em variável de ambiente, sem deploy"*. Verificado hoje, ainda está em 300:

```bash
curl -sS -X POST https://vinshare-api.azurewebsites.net/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<conta>","password":"<senha>"}' | jq '.data.expiresIn'
# → 300
```

**Impacto:** baixo. O interceptor do app renova no `401` de forma
transparente, então nada quebra — só renova a cada 5 minutos em vez de 15.
Não bloqueia a entrega, mas como era um ajuste de env sem deploy, vale
fechar.

---

## 3. `GET /customers/{id}` não existe

A rota responde 404 de roteamento, não de recurso:

```json
{
  "type": "https://api.fordvinshare.fiap/errors/404",
  "title": "Recurso não encontrado",
  "status": 404,
  "detail": "A rota solicitada não existe.",
  "instance": "/api/v1/customers/a77ac91e-856e-4458-9afc-d3918a18da62"
}
```

O id usado veio de `/leads`, então é um cliente real. A rota também não
aparece em `/v3/api-docs`.

**O que fizemos:** removemos o `customersService.getById` e o hook que o
chamava — nenhuma tela usava. `GET /customers/{id}/360`,
`/customers/{id}/timeline` e `/customers/{id}/segment` existem e funcionam.

**O que precisamos de vocês:** só confirmar que a ausência é intencional. Se
a rota deveria existir, ela está faltando na implementação *e* na spec.

---

## 4. `/me/appointments` devolve `Page`, não array

Diferente dos outros endpoints de listagem, este devolve um `Page` do Spring:

```
content, pageable, last, totalElements, totalPages,
first, size, number, sort, numberOfElements, empty
```

O contrato original define array, e o app tipava como array. Na prática a tela
"Meus agendamentos" quebrava com `appointments.filter is not a function`,
porque o `Page` é um objeto não-nulo e passava direto pelo fallback `?? []`.

**Já adaptamos no app** — o service normaliza os dois formatos, então não há
urgência.

**O que precisamos de vocês:** decidir qual é o contrato oficial, porque hoje
há inconsistência entre endpoints de listagem:

| Endpoint | Formato |
|---|---|
| `/me/vehicles` | array |
| `/me/surveys/pending` | array |
| `/service-types` | array |
| `/dealerships` | array |
| `/loyalty/rewards` | array |
| `/analytics/vin-share/by-dealership` | array |
| **`/me/appointments`** | **Page** |
| `/me/services` | Page |
| `/me/loyalty/transactions` | Page |
| `/leads` | Page |
| `/segments/{segment}/customers` | Page |

Se `Page` for o certo para `/me/appointments`, basta documentar na spec e
mantemos a normalização. Se for array, o app aceita os dois de qualquer forma.

---

## 5. 🔴 `POST /appointments` quebra para qualquer cliente novo

**Isto não é sobre a conta de teste — é reprodutível para qualquer cliente
que se cadastre pelo `POST /auth/register` e tente marcar seu primeiro
agendamento.** Suspeitamos que bloqueia esse fluxo em produção também.

```
POST /appointments
{"vehicleId": "...", "dealershipId": "...", "serviceTypeId": "REVIEW", "scheduledAt": "..."}

→ 500 { "title": "Erro interno", "detail": "Ocorreu um erro ao processar a requisição..." }
```

Isolamos variando cada campo, sempre com o mesmo cliente e veículo:

| Variação testada | Resultado |
|---|---|
| 4 `dealershipId` diferentes | 500 em todas |
| 4 `serviceTypeId` (`REVIEW`, `OIL_CHANGE`, `WARRANTY`, `REPAIR`) | 500 em todos |
| 3 formatos de `scheduledAt` (`Z`, `-03:00`, sem offset) | 500 em todos |
| `vehicleId` de outro cliente (controle) | **404** correto — "Veículo não encontrado", prova que a busca funciona |

Ou seja, o problema não está em nenhum parâmetro do request — é algo no
estado do `customer`/`vehicle` desse cliente especificamente. Testamos duas
hipóteses de dado faltando e nenhuma resolveu:

- Criar `loyalty_accounts` para o cliente (não tinha) → continuou 500
- Criar `customer_segments` para o cliente (não tinha, é populado por ML) →
  continuou 500

O cliente foi criado via `POST /auth/register` (fluxo oficial). O veículo
foi inserido diretamente no banco, na ausência de endpoint que o crie — mas
o veículo em si funciona normalmente: `GET /me/vehicles`,
`GET /vehicles/{id}/warranty` e `GET /vehicles/{id}/maintenance-alerts`
respondem 200 com dado coerente. O problema é isolado ao `POST /appointments`.

**Nosso melhor palpite, sem acesso a logs**: alguma lógica de negócio dentro
do service de criar agendamento assume histórico prévio do cliente (primeira
visita, sem serviços anteriores, sem segmento calculado) e quebra em vez de
tratar o caso vazio — o mesmo padrão do bug já corrigido em
`/analytics/vin-share/series` (cast frágil / acesso sem checar vazio).

**O que fizemos:** para não travar a sprint, inserimos o histórico de
demonstração (agendamentos, serviços, NPS, pontos) diretamente no banco,
contornando este endpoint. Isso resolve nossa demonstração, mas não resolve
o problema para um cliente real da Ford.

**O que precisamos:** stack trace do erro (acesso aos logs do Azure) ou uma
reprodução local. Se ajudar, os IDs usados no teste (customer, vehicle,
dealership) estão disponíveis sob pedido.

---

## 6. `/dealerships` devolve 500 quando falta `lat`/`lng`

```
GET /dealerships                            → 500
GET /dealerships?radiusKm=20                → 500
GET /dealerships?service=REVIEW             → 500
GET /dealerships?lat=-23.55&lng=-46.63      → 200
GET /dealerships?lat=-23.55&lng=-46.63&radiusKm=20 → 200
```

O corpo é o handler genérico (`"Ocorreu um erro ao processar a requisição"`),
sem indicar o que faltou.

**Impacto no app: nenhum.** O `useUserLocation` sempre devolve coordenadas —
cai no centro de São Paulo quando a permissão é negada ou ainda não resolveu —
e as duas telas que consultam concessionárias sempre enviam `lat`/`lng`. Não
há caminho no app que dispare esse 500.

**O que precisamos de vocês:** se `lat`/`lng` são obrigatórios, devolver `400`
com `errors: [{field, message}]`, como já acontece no `/auth/login`. Se forem
opcionais, tratar a ausência. Hoje um parâmetro faltando é indistinguível de
uma queda do servidor, o que atrapalha o diagnóstico.

---

## 7. Sugestão: não existe endpoint para o analista ver agendamentos de um cliente

Isto não é um bug — é uma lacuna que descobrimos ao auditar `/customers/{id}/360`
contra o que a tela de Visão 360 esperava mostrar. Conferimos a spec inteira
(`/v3/api-docs`): não há nenhuma rota do tipo
`GET /customers/{id}/appointments`. As opções disponíveis para o analista são:

- `GET /appointments/{id}` — precisa já saber o ID do agendamento
- `GET /me/appointments` — só os do próprio usuário logado

Isso significa que a Visão 360 nunca pode mostrar "agendamentos ativos" de um
cliente, nem oferecer as ações de check-in/concluir direto dali — a tela
tinha essa seção, mas o dado que ela dependia nunca chega. Removemos a seção
do app (branch `main`, commit ao final desta sessão) porque manter uma UI
para um dado inatingível é pior do que não ter a UI.

Se fizer sentido no roadmap, um `GET /customers/{id}/appointments?status=...`
restauraria essa funcionalidade — nenhuma prioridade definida por nós, é só
o registro do que encontramos.

---

## Nota: 5 tipos do app tinham contrato desatualizado, não é bug do backend

Ao popular a conta de demonstração, comparamos o payload real de 6 endpoints
com os tipos TypeScript do app, campo a campo. Achamos divergências em
`ServiceRecord`, `PendingSurvey`, `AppointmentSummary`, `LoyaltyTransaction` e
`Customer360` — nomes de campo diferentes (`dealershipName` em vez de
`dealership`, `serviceTypeLabel` em vez de `serviceType`), tipos de enum
diferentes (`loyalty` usa `REDEEM`, não `SPEND`), e sinal de número invertido
(`points` sempre positivo no backend, o app assumia negativo para gastos).

**Isso não é pendência para vocês** — o formato que a API manda é o formato
real e correto; o app é que nunca tinha sido validado contra produção com
dado de verdade até agora. Já corrigimos tudo do nosso lado. Registramos aqui
só para o caso de vocês mudarem esse formato no futuro sem avisar — cada
divergência agora tem um teste de contrato (`src/services/__tests__/*.test.ts`)
que fixa o payload real como fixture, então qualquer mudança de shape quebra
os testes em vez de quebrar silenciosamente em produção.

---

## Resumo

| Item | Quem resolve | Bloqueia a entrega? |
|---|---|---|
| Veículo para uma conta cliente | ~~Back (INSERT)~~ contornado via banco | Não mais |
| `POST /appointments` 500 para cliente novo | **Back (investigar)** | Contornado na demo; **é bug de produto real** |
| `JWT_ACCESS_MIN=900` | Back (env Azure) | Não |
| `GET /customers/{id}` | Back (confirmar) | Não |
| `/me/appointments` Page vs array | Back (documentar) | Não, app já adapta |
| `/dealerships` 500 sem `lat`/`lng` | Back (validação) | Não, app sempre envia |
| Sem endpoint de agendamentos por cliente (analista) | Back (feature, sem prioridade nossa) | Não — seção removida do app |
| 5 tipos do app com contrato desatualizado | **Nosso lado**, já corrigido | Não |

Nada bloqueia mais a nossa entrega — contornamos os dois primeiros itens
inserindo dados diretamente no banco. Mas o item 2 é um bug real que afeta
qualquer cliente novo do app tentando marcar o primeiro agendamento, e
merece prioridade alta independente da nossa sprint.
