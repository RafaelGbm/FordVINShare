# 🛠️ Build e distribuição

Guia rápido para sair do `npm start` no Expo Go e gerar binários reais.

## Pré-requisitos

```bash
npm install --global eas-cli
eas login   # conta Expo
```

Crie um projeto no Expo dashboard (https://expo.dev) e copie o `projectId` para
`app.json` em `extra.eas.projectId`. Sem isso o push token só funciona em Expo Go local.

## Perfis de build (`eas.json`)

| Perfil | Distribuição | API URL | Uso |
|---|---|---|---|
| `development` | internal | `http://localhost:8080/api/v1` | dev client em device físico |
| `preview` | internal (APK) | `https://api-hml.ford.example/api/v1` | testers/QA |
| `production` | stores | `https://api.ford.example/api/v1` | release |

> Substitua as URLs `*.ford.example` quando o time de back publicar os domínios definitivos.

## Builds

```bash
# Dev client (precisa do projectId configurado)
eas build --profile development --platform android
eas build --profile development --platform ios

# Preview interno (APK Android, IPA ad-hoc no iOS)
eas build --profile preview --platform all

# Release oficial
eas build --profile production --platform all
```

## Submissão

```bash
# Após uma build production passar:
eas submit --platform android   # Google Play
eas submit --platform ios       # App Store Connect
```

## Push notifications

1. Faça login no [Expo Push Notifications](https://expo.dev/notifications)
2. Use o projeto recém-criado (mesmo `projectId`)
3. O backend Java deve enviar para o endpoint `https://exp.host/--/api/v2/push/send`
   com o token recebido em `POST /me/devices`

## Variáveis de ambiente

Locais: `.env` (gitignored) lido pelo Metro durante `npm start`.

Builds remotos: configurar em `eas env:create` ou nos blocos `env` de `eas.json`.
