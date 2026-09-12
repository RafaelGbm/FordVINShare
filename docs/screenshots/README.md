# Capturas de tela

Pasta das imagens usadas na seção **Telas** do [README principal](../../README.md).

## Como capturar

Rodar o APK de `preview` num aparelho Android (ou emulador) com o backend no ar
e logar com uma conta real — as capturas precisam mostrar dados vindos da API,
não estados vazios.

```bash
eas build --profile preview --platform android
```

No aparelho: **Power + Volume ↓**. No emulador do Android Studio: botão de
câmera na barra lateral.

## Convenção

Um arquivo PNG por tela, na ordem em que aparecem no fluxo. O nome é o que o
README referencia, então precisa bater exatamente:

| # | Arquivo | Tela | Como chegar |
|---|---|---|---|
| 01 | `01-login.png` | Login | Abrir o app deslogado |
| 02 | `02-cliente-home.png` | Home do cliente | Login como CLIENT |
| 03 | `03-cliente-agendar.png` | Agendar serviço | Aba "Agendar" |
| 04 | `04-cliente-localizador.png` | Localizador | Aba "Localizador" (permitir localização) |
| 05 | `05-cliente-pontos.png` | Pontos e prêmios | Aba "Pontos" |
| 06 | `06-cliente-chat.png` | Chat Ford AI | Aba "Chat", após uma resposta |
| 07 | `07-cliente-perfil.png` | Perfil | Aba "Perfil" |
| 08 | `08-cliente-agendamentos.png` | Meus agendamentos | Perfil → "Meus agendamentos" |
| 09 | `09-cliente-nps.png` | Pesquisa NPS | Home → banner de NPS pendente |
| 10 | `10-cliente-odometro.png` | Atualizar odômetro | Home → card do veículo |
| 11 | `11-analista-dashboard.png` | Dashboard | Login como ANALYST |
| 12 | `12-analista-leads.png` | Leads em risco | Aba "Leads" |
| 13 | `13-analista-segmentacao.png` | Segmentação | Aba "Segmentação" |
| 14 | `14-analista-visao360.png` | Visão 360 | Leads → tocar num lead |

## Antes de commitar

- **Sem dados pessoais reais.** As telas de Leads, Visão 360 e Perfil mostram
  nome, CPF mascarado, telefone e email. Se a base tiver gente de verdade,
  usar uma conta de teste ou borrar os campos.
- Recortar a barra de status se ela mostrar notificações pessoais.
- PNG, orientação retrato, largura original do aparelho (não redimensionar).
