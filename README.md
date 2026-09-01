# Clínica Médica GC2 - API de Produtos

API REST em **TypeScript + Node.js + Express** com **PostgreSQL** via **Docker Compose** para gerenciamento de produtos da clínica.

## Stack

- Node.js 20 + TypeScript 5
- Express 4
- PostgreSQL 15 (Docker)
- pg (node-postgres)

## Pré-requisitos

- Node.js >= 18
- npm
- Docker e Docker Compose

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/rillmind/clinica-medica-gc2.git
cd clinica-medica-gc2
```

2. Configure variáveis de ambiente:
```bash
cp .env.example .env
# edite .env se necessário
```

Crie um `.env` na raiz:
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/clinica
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=clinica
```

> Quando rodar via Docker Compose, o `DB_HOST` deve ser `db` e `DATABASE_URL` = `postgres://postgres:postgres@db:5432/clinica` (já configurado no `docker-compose.yml`).

## Como rodar a API

### Opção 1: Docker Compose (recomendado)

Sobe API + Postgres de uma vez:

```bash
docker compose up --build
```

- API: http://localhost:3000
- Postgres: localhost:5432 (user: `postgres`, pass: `postgres`, db: `clinica`)

Para rodar em background:
```bash
docker compose up --build -d
docker compose logs -f api
```

Parar:
```bash
docker compose down
# para limpar volumes:
docker compose down -v
```

### Opção 2: Local (Postgres no Docker, API via npm)

1. Suba apenas o banco:
```bash
docker compose up db -d
```

2. Instale dependências e rode a API:
```bash
npm install
npm run dev
```

API em http://localhost:3000 com hot-reload (`ts-node-dev`).

Outros scripts:
```bash
npm run build   # compila TS -> dist
npm start       # roda JS compilado (produção)
```

### Banco de dados

O `init.sql` e `initDatabase()` criam automaticamente a tabela:

```sql
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/produtos` | Lista todos os produtos |

### Exemplo: GET /produtos

Request:
```bash
curl http://localhost:3000/produtos
```

Response `200`:
```json
[
  {
    "id": 1,
    "nome": "Dipirona 500mg",
    "descricao": "Analgésico e antitérmico",
    "preco": "12.50",
    "criado_em": "2026-08-31T00:00:00.000Z"
  }
]
```

## Estrutura do projeto

```
.
├── src/
│   ├── app.ts              # Configuração Express
│   ├── server.ts           # Bootstrap + init DB
│   ├── config/database.ts  # Pool PG
│   ├── routes/produtos.ts  # Rotas /produtos
│   └── types/produto.ts    # Interfaces
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── package.json
└── tsconfig.json
```
