# AgendaFlex Backend

API do AgendaFlex, uma plataforma multi-area para gerenciamento de agendamentos.

## Configuracao

1. Crie o banco PostgreSQL:

```sql
CREATE DATABASE agendaflex;
```

2. Ajuste `backend/.env` com a senha do PostgreSQL.

3. Rode o schema:

```bash
psql -U postgres -d agendaflex -f backend/src/database/schema.sql
```

4. Inicie a API:

```bash
npm run dev
```

## Variaveis de ambiente

Copie `backend/.env.example` para `backend/.env` e ajuste:

- `PORT`: porta da API.
- `NODE_ENV`: use `production` no deploy.
- `DATABASE_URL`: string de conexao PostgreSQL. Para Neon, prefira `sslmode=verify-full`.
- `JWT_SECRET`: segredo com pelo menos 32 caracteres em producao.
- `FRONTEND_URL`: URL publica do frontend.
- `CORS_ORIGINS`: origens permitidas para chamadas do navegador, separadas por virgula.
- `API_PUBLIC_URL`: URL publica da API para webhooks.
- `MERCADO_PAGO_ACCESS_TOKEN`: token do Mercado Pago.
- `WHATSAPP_*`: credenciais da Meta/WhatsApp Cloud API.

Em producao, a API falha ao iniciar se `DATABASE_URL` ou `JWT_SECRET` nao estiverem configurados.

## Saude da API

- `GET /health`: verifica se o processo HTTP esta ativo.
- `GET /ready`: verifica se a API consegue consultar o banco.

Essas rotas podem ser usadas no deploy para health checks.

## Checklist de producao

1. Configure `NODE_ENV=production`.
2. Use `JWT_SECRET` forte e exclusivo do ambiente.
3. Configure `FRONTEND_URL` e `CORS_ORIGINS` com os dominios reais.
4. Configure `API_PUBLIC_URL` antes de ativar webhooks do Mercado Pago ou WhatsApp.
5. Rode `backend/src/database/schema.sql` no banco de producao.
6. Verifique `/health` e `/ready` depois do deploy.
7. Confirme que `backend/.env` nao foi commitado.

## Rotas iniciais

- `GET /health`
- `GET /ready`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/clientes`
- `POST /api/clientes`
- `GET /api/profissionais`
- `POST /api/profissionais`
- `GET /api/servicos`
- `POST /api/servicos`
- `GET /api/agendamentos?data=YYYY-MM-DD`
- `POST /api/agendamentos`
- `PATCH /api/agendamentos/:id/status`
- `GET /api/dashboard/resumo`
