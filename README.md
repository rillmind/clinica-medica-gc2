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
| POST | `/produtos` | Cria um novo produto |

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

### Exemplo: POST /produtos

Request:
```bash
curl -X POST http://localhost:3000/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ibuprofeno 400mg", "descricao": "Anti-inflamatório", "preco": 15.75}'
```

Response `201`:
```json
{
  "id": 3,
  "nome": "Ibuprofeno 400mg",
  "descricao": "Anti-inflamatório",
  "preco": "15.75",
  "criado_em": "2026-08-31T00:00:00.000Z"
}
```

Erros `400`:
```json
{ "error": "Campo \"nome\" é obrigatório e deve ser uma string não vazia" }
{ "error": "Campo \"preco\" é obrigatório e deve ser um número" }
```

## Workflow de Git escolhido: Gitflow

Este projeto utiliza **Gitflow** como workflow de versionamento.

### Por que Gitflow?

Considerando as características exigidas (evolução incremental por feature: `GET /produtos`, `POST /produtos`, documentação), o Gitflow foi escolhido pelos seguintes motivos:

1.  **Isolamento de features**: cada requisito da API vira uma `feature/*` branch a partir de `develop`. Isso evita que código incompleto quebre a integração e permite PRs focados.
2.  **Branch `develop` como integração**: todas as features são mergeadas em `develop` com `--no-ff`, preservando histórico semântico. Só quando `develop` está estável, gera-se `release`/`main`.
3.  **Histórico organizado e auditável**: cada ponto das "Características da API" tem commits dedicados, facilitando `git log --graph` e reversão seletiva.
4.  **Escalabilidade**: mesmo sendo uma API pequena hoje, Gitflow já prepara o time para `hotfix/*` em produção (`main`) e `release/*` para versionamento futuro, ao contrário de Trunk-based que exige CI/CD maduro.
5.  **Alinhado ao enunciado**: o exercício pede explicitamente "use o workflow gitflow de acordo com cada ponto de características da api" e commits separados para `git push` posterior.

Alternativas descartadas:
- **GitHub Flow** (main + feature branches direto): mais simples, mas não entrega separação clara entre `main` (produção) e `develop` (integração) que o Gitflow fornece para múltiplas entregas paralelas.
- **Trunk-based**: ótimo para deploy contínuo, porém overkill e arriscado sem pipeline robusto de testes.

### Estrutura de branches do projeto

```
main (produção, estável)
  \
   develop (integração)
     ├── feature/get-produtos       # GET /produtos
     ├── feature/readme-setup       # README como rodar
     ├── feature/post-produtos      # POST /produtos
     └── docs/workflow-gitflow      # Este trecho do README
```

### Histórico de commits (como foi executado)

```bash
# setup inicial
git init -b main
git commit -m "chore: setup inicial..."
git checkout -b develop

# feature GET
git checkout -b feature/get-produtos
git commit -m "feat: adiciona rota GET /produtos"
git checkout develop && git merge --no-ff feature/get-produtos

# docs README
git checkout -b feature/readme-setup
git commit -m "docs: cria README..."
git checkout develop && git merge --no-ff feature/readme-setup

# feature POST
git checkout -b feature/post-produtos
git commit -m "feat: adiciona rota POST /produtos"
git checkout develop && git merge --no-ff feature/post-produtos

# docs workflow (esta seção)
git checkout -b docs/workflow-gitflow
git commit -m "docs: atualiza README com workflow Gitflow..."

# finalização
git checkout develop && git merge --no-ff docs/workflow-gitflow
git checkout main && git merge --no-ff develop
# git tag -a v1.0.0 -m "release v1.0.0 - API produtos completa"
```

Para subir ao GitHub (já com commits prontos):
```bash
git remote add origin https://github.com/rillmind/clinica-medica-gc2.git
git push -u origin main
git push -u origin develop
# opcional: push das feature branches se quiser preservar histórico remoto
git push origin feature/get-produtos feature/readme-setup feature/post-produtos
```

### Convenção de commits

- `chore:` setup/config
- `feat:` nova funcionalidade (GET, POST)
- `docs:` documentação

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
