# AgendaFlex Backend

API inicial do AgendaFlex, uma plataforma multi-area para gerenciamento de agendamentos.

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

## Rotas iniciais

- `POST /api/auth/register`
- `POST /api/auth/login`
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
