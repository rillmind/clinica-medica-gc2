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
| GET | `/produtos/:id` | Busca um produto por id (404 se não existe) |
| POST | `/produtos` | Cria um novo produto |
| DELETE | `/produtos/:id` | Remove um produto (204 se removido, 404 se não existe) |

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

### Exemplo: GET /produtos/:id

Request:
```bash
curl http://localhost:3000/produtos/1
```

Response `200`:
```json
{
  "id": 1,
  "nome": "Dipirona 500mg",
  "descricao": "Analgésico e antitérmico",
  "preco": "12.50",
  "criado_em": "2026-08-31T00:00:00.000Z"
}
```

Erro `404` (não existe):
```json
{ "error": "Produto não encontrado" }
```

Erro `400` (id inválido):
```json
{ "error": "Parâmetro \"id\" deve ser um número inteiro positivo" }
```

### Exemplo: DELETE /produtos/:id

Request:
```bash
curl -X DELETE http://localhost:3000/produtos/1 -i
```

Response `204` (sem corpo) quando removido.

Erro `404` (não existe):
```json
{ "error": "Produto não encontrado" }
```

## Workflow de Git escolhido: GitHub Flow

A partir desta entrega o projeto usa **GitHub Flow** (a fase anterior usava Gitflow com `main + develop`; o histórico antigo foi mantido).

### Por que GitHub Flow?

1. **Simplicidade**: só `main` (produção) + branches curtas `feature/*` / `docs/*` + Pull Request.
2. **CI como portão**: nenhum merge entra sem `Quality` verde (build + lint + testes + cobertura >=90%).
3. **Commits assinados obrigatórios**: todo commit é `-S` (GPG) e a proteção exige assinatura verificada.
4. **Alternância de autores**: commits alternados entre Bryan Belo e Raul Holanda Lopes, mantendo o padrão `feat:/test:/ci:/docs:`.

### Estrutura de branches do projeto (fase atual)

```
main (produção, protegida)
  ├── feature/get-produto-by-id       # GET /produtos/:id (Bryan)
  ├── feature/delete-produtos         # DELETE /produtos/:id (Raul)
  ├── feature/testes-novos-endpoints  # testes 404/204, 100% cobertura (Bryan)
  ├── feature/quality-workflow        # quality.yml + eslint (Raul)
  └── docs/github-flow-assinatura     # este trecho do README (Bryan)
homolog (pré-produção, protegida, espelha main antes do deploy)
```

### Histórico de commits (como foi executado, todos assinados)

```bash
# chaves (uma por dev, geradas localmente)
gpg --full-generate-key  # Raul Holanda Lopes <raulzc00@gmail.com>
gpg --full-generate-key  # Bryan Belo <Bryanbeloo4224@hotmail.com>
gpg --armor --export <KEYID>  # subir em GitHub > Settings > SSH and GPG keys
git config --global commit.gpgsign true
git config --global user.signingkey <KEYID>

# GitHub Flow a partir da main
git checkout main
git checkout -b feature/get-produto-by-id
git -c user.name="Bryan Belo" -c user.email="Bryanbeloo4224@hotmail.com" \
  -c user.signingkey=<KEY_BRYAN> commit -S -m "feat: adiciona rota GET /produtos/:id com 404 quando não existe"
git checkout main && git merge --no-ff feature/get-produto-by-id  # via PR

git checkout -b feature/delete-produtos
git -c user.name="Raul Holanda Lopes" -c user.email="raulzc00@gmail.com" \
  -c user.signingkey=<KEY_RAUL> commit -S -m "feat: adiciona rota DELETE /produtos/:id com 404 e 204"

git checkout -b feature/testes-novos-endpoints
# test: adiciona testes para GET by id e DELETE com 404 e 204 (Bryan, -S)

git checkout -b feature/quality-workflow
# ci: adiciona job de qualidade com testes, cobertura e linter (Raul, -S)

git checkout -b docs/github-flow-assinatura
# docs: migra README para GitHub Flow e documenta assinatura GPG + proteção (Bryan, -S)

git log --show-signature --oneline --graph  # G = assinatura válida
```

### Convenção de commits

- `chore:` setup/config
- `feat:` nova funcionalidade (GET, GET by id, POST, DELETE)
- `docs:` documentação
- `test:` adição ou alteração de testes unitários/integração
- `ci:` configuração de pipelines de integração contínua (GitHub Actions)

Todos os commits são assinados (`git commit -S`, GPG) e alternam autores `Bryan Belo <Bryanbeloo4224@hotmail.com>` / `Raul Holanda Lopes <raulzc00@gmail.com>`.

## Commits assinados (GPG)

1. Gerar (um par por dev; aqui foram gerados os dois localmente para a entrega — o Bryan pode gerar outro na máquina dele depois sem invalidar os antigos):
   ```bash
   gpg --full-generate-key
   gpg --list-secret-keys --keyid-format LONG
   gpg --armor --export <KEYID>  # chave pública
   ```
2. Subir a pública no GitHub: `Settings > SSH and GPG keys > New GPG key` (cada dev na sua conta; a pública gerada nesta máquina para o Bryan deve ser cadastrada na conta dele).
3. Configurar:
   ```bash
   git config --global gpg.program gpg
   git config --global commit.gpgsign true
   git config --global tag.gpgsign true
   git config --global user.signingkey <SEU_KEYID>
   ```
4. Commit assinado alternando autor:
   ```bash
   git -c user.name="Bryan Belo" -c user.email="Bryanbeloo4224@hotmail.com" -c user.signingkey=<KEY_BRYAN> commit -S -m "feat: ..."
   git -c user.name="Raul Holanda Lopes" -c user.email="raulzc00@gmail.com" -c user.signingkey=<KEY_RAUL> commit -S -m "feat: ..."
   git log --show-signature --oneline  # G = válida
   ```

## Proteção de branches (homologação e produção)

Configurar em `GitHub > Settings > Branches > Add classic branch protection rule`:

- `main` (produção) e `homolog` (pré-produção):
  - [x] `Require a pull request before merging` (mín. 1 approval, `Dismiss stale approvals`)
  - [x] `Require status checks before merging` → exigir `Quality / Qualidade (testes, cobertura e linter)`
  - [x] `Require signed commits` (ou `Require verified signatures` — todos os commits `-S`)
  - [x] `Do not allow bypassing the above settings`
  - [x] `Restrict who can push` (só via PR, sem push direto)
- Fluxo: `feature/*` → PR → `homolog` (validação) → PR → `main` (deploy).

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

3. **`Quality` (`.github/workflows/quality.yml`) — job de qualidade**:
   - **Gatilho**: `push` em qualquer branch + PR para `main`, `homolog`, `develop`.
   - **Etapas**:
     - Compilar o projeto (`npm run build`);
     - Verificação de linter (`npm run lint` = `tsc --noEmit` + `eslint src tests --max-warnings 0`);
     - Execução dos testes de unidade e integração (`npm test`);
     - Verificação da cobertura de código (`npm run test:coverage`, threshold 90% — atual em 100%).
   - Esse é o check obrigatório na proteção de `main`/`homolog`.

## Estrutura do projeto

```
.
├── .github/
│   └── workflows/
│       ├── commit.yml          # Pipeline de CI para commits/push
│       ├── pull-request.yml    # Pipeline de CI para Pull Requests
│       └── quality.yml         # Job de qualidade: build + lint + testes + cobertura
├── eslint.config.mjs           # Linter (flat config, TS + Node + Jest)
├── src/
│   ├── app.ts                  # Configuração Express
│   ├── server.ts               # Bootstrap + init DB
│   ├── config/database.ts      # Pool PG
│   ├── routes/produtos.ts      # Rotas /produtos (GET, GET :id, POST, DELETE :id)
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
