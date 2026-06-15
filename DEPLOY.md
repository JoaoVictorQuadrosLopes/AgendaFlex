# Deploy gratuito do AgendaFlex

Este projeto esta preparado para um deploy gratuito usando:

- Render para o backend Express.
- Render Static Site para o frontend Vite.
- Neon para o banco PostgreSQL.

## 1. Banco no Neon

1. Crie um projeto no Neon.
2. Copie a connection string PostgreSQL.
3. Rode o schema em `backend/src/database/schema.sql` no banco de producao.
4. Use a URL com SSL, por exemplo:

```text
postgresql://usuario:senha@host/neondb?sslmode=verify-full
```

## 2. Deploy no Render

1. Suba o repositorio para o GitHub.
2. No Render, crie um Blueprint apontando para este repositorio.
3. O arquivo `render.yaml` cria:
   - `agendaflex-api`
   - `agendaflex-web`
4. Preencha no painel do Render as variaveis marcadas como secret:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `MERCADO_PAGO_ACCESS_TOKEN`, quando ativar pagamentos.
   - `WHATSAPP_*`, quando ativar WhatsApp real.

## 3. URLs esperadas

O blueprint usa estas URLs:

```text
Frontend: https://agenda-flex-woad.vercel.app
Backend:  https://agendaflex-api.onrender.com
API:      https://agendaflex-api.onrender.com/api
```

Se o Render gerar outro subdominio ou se voce usar dominio proprio, ajuste:

- `FRONTEND_URL`
- `CORS_ORIGINS`
- `API_PUBLIC_URL`
- `VITE_API_URL`

## 4. Verificacao depois do deploy

Teste estas URLs:

```text
https://agendaflex-api.onrender.com/health
https://agendaflex-api.onrender.com/ready
https://agendaflex-web.onrender.com
```

`/health` confirma que a API subiu. `/ready` confirma que a API conseguiu consultar o banco.

## Observacoes do plano gratuito

Servicos gratuitos podem dormir apos inatividade e demorar alguns segundos para responder na primeira chamada. Para MVP, demo e validacao comercial, isso e aceitavel; para cliente pagando, o ideal e migrar pelo menos o backend para plano pago.
