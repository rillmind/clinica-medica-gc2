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
npm run build         # compila TS -> dist
npm start             # roda JS compilado (produção)
npm test              # executa a suíte de testes com Jest
npm run test:coverage # executa os testes com relatório e garantia de 90% de cobertura
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

Usei **Gitflow** nesse projeto porque fazia mais sentido com o que foi pedido no enunciado.

### Por que Gitflow?

O exercício pede pra usar Gitflow dividindo cada ponto das “Características da API” em branches/features com commits separados. Então escolhi Gitflow por alguns motivos práticos:

1.  **Isolamento por feature**: cada entrega (`GET /produtos`, `POST /produtos`, docs) ficou em uma `feature/*` criada a partir de `develop`. Assim não quebro a branch de integração enquanto a feature não está pronta.
2.  **Branch `develop` como integração**: todas as features são mergeadas em `develop` com `--no-ff` pra manter o histórico certinho. Só quando `develop` ficou estável fiz o merge pra `main`.
3.  **Histórico organizado**: cada requisito tem seu commit/branch, então fica fácil dar `git log --graph` e se precisar reverter algo é mais tranquilo.
4.  **Já deixa preparado pra escalar**: mesmo sendo uma API pequena, o Gitflow já deixa `hotfix/*` e `release/*` prontos pra quando precisar. Trunk-based e GitHub Flow são mais simples, mas pedem um CI/CD mais maduro e não separam tão bem `main` (produção) de `develop` (integração).

Cheguei a considerar:

- **GitHub Flow** (só `main` + feature branches): mais simples, mas perde a separação `main` x `develop` que o Gitflow dá.
- **Trunk-based**: bom pra deploy contínuo, mas pra esse trabalho seria overkill e mais arriscado sem pipeline de testes.

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
- `test:` adição ou alteração de testes unitários/integração
- `ci:` configuração de pipelines de integração contínua (GitHub Actions)

## Integração Contínua (CI / GitHub Actions)

O repositório conta com dois fluxos de trabalho automatizados configurados via GitHub Actions:

1. **`CI - Commits` (`.github/workflows/commit.yml`)**:
   - **Gatilho**: Disparado a cada evento de commit/push em qualquer branch (`**`).
   - **Etapas**:
     - Clonar repositório e alternar para a branch correspondente;
     - Instalar compilador/interpretador (Node.js 20);
     - Instalar dependências do projeto (`npm ci`);
     - Compilar o projeto TypeScript (`npm run build`);
     - Executar a suíte de testes (`npm test`);
     - Garantir cobertura mínima de 90% via Jest (`npm run test:coverage`).

2. **`CI - Pull Request` (`.github/workflows/pull-request.yml`)**:
   - **Gatilho**: Disparado ao abrir, sincronizar ou reabrir Pull Requests para as branches `main` e `develop`.
   - **Etapas**:
     - Clonar repositório e alternar para a branch do PR;
     - Instalar compilador/interpretador (Node.js 20);
     - Instalar dependências do projeto (`npm ci`);
     - Compilar o projeto TypeScript (`npm run build`);
     - Executar a suíte de testes (`npm test`);
     - Garantir cobertura mínima de 90% via Jest (`npm run test:coverage`).

## Estrutura do projeto

```
.
├── .github/
│   └── workflows/
│       ├── commit.yml          # Pipeline de CI para commits/push
│       └── pull-request.yml    # Pipeline de CI para Pull Requests
├── src/
│   ├── app.ts                  # Configuração Express
│   ├── server.ts               # Bootstrap + init DB
│   ├── config/database.ts      # Pool PG
│   ├── routes/produtos.ts      # Rotas /produtos
│   └── types/produto.ts        # Interfaces
├── tests/
│   ├── health.test.ts          # Testes do endpoint /health
│   └── produtos.test.ts        # Testes das rotas /produtos (100% de cobertura)
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── jest.config.ts              # Configuração do Jest com threshold de 90%
├── package.json
└── tsconfig.json
```
