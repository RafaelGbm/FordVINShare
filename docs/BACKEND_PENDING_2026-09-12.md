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

## 5. `/dealerships` devolve 500 quando falta `lat`/`lng`

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

## Resumo

| Item | Quem resolve | Bloqueia a entrega? |
|---|---|---|
| Veículo para uma conta cliente | **Back (INSERT)** | **Sim** |
| `JWT_ACCESS_MIN=900` | Back (env Azure) | Não |
| `GET /customers/{id}` | Back (confirmar) | Não |
| `/me/appointments` Page vs array | Back (documentar) | Não, app já adapta |
| `/dealerships` 500 sem `lat`/`lng` | Back (validação) | Não, app sempre envia |

O item 1 é o único que trava a sprint. Os outros quatro são fechamento.
