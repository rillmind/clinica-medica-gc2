# Clínica Médica GC2 - API de Produtos

[![Quality CI/CD](https://github.com/rillmind/clinica-medica-gc2/actions/workflows/quality.yml/badge.svg)](https://github.com/rillmind/clinica-medica-gc2/actions/workflows/quality.yml)
[![DockerHub](https://badgen.net/badge/icon/dockerhub?icon=docker&label=bryanbelo%2Fclinica-medica-gc2&color=blue)](https://hub.docker.com/r/bryanbelo/clinica-medica-gc2)
[![Docker Pulls](https://badgen.net/docker/pulls/bryanbelo/clinica-medica-gc2?icon=docker&label=pulls)](https://hub.docker.com/r/bryanbelo/clinica-medica-gc2)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rillmind_clinica-medica-gc2&metric=alert_status)](https://sonarcloud.io/project/overview?id=rillmind_clinica-medica-gc2)
[![Coverage](https://badgen.net/badge/coverage/100%25/green)](https://github.com/rillmind/clinica-medica-gc2)
[![License](https://badgen.net/badge/license/ISC/grey)](LICENSE)

API REST em **TypeScript + Node.js + Express** com **PostgreSQL** via **Docker Compose** para gerenciamento de produtos da clínica.

## Por que existe

É o projeto da disciplina de Gestão de Configuração II (IFPE, 2026.2). O foco não é a API em si,
mas o processo em volta dela: workflow de branches (GitHub Flow), commits assinados com GPG,
proteção de branch e integração contínua com testes, linter e cobertura mínima.

## Stack

- Node.js 20 + TypeScript 5
- Express 4
- PostgreSQL 15 (Docker)
- pg (node-postgres)

## 🐳 Imagens Docker no DockerHub

As imagens da aplicação são construídas e publicadas automaticamente no **DockerHub** através do pipeline de CI/CD do GitHub Actions:

- 📦 **Repositório oficial no DockerHub:** [https://hub.docker.com/r/bryanbelo/clinica-medica-gc2](https://hub.docker.com/r/bryanbelo/clinica-medica-gc2)
- 🏷️ **Tags disponíveis:**
  - `:latest` — Imagem correspondente à última versão estável na branch principal (`main`).
  - `:<commit-sha>` — Tag imutável baseada no hash do commit da baseline.

### Como baixar e rodar a imagem do DockerHub

```bash
# 1. Baixar a imagem do DockerHub
docker pull bryanbelo/clinica-medica-gc2:latest

# 2. Executar o container conectado ao Postgres
docker run -d \
  --name clinica_api \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5432/clinica \
  bryanbelo/clinica-medica-gc2:latest
```


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

## Como testar

Os testes usam Jest + Supertest com o banco simulado (`jest.mock`), então não precisam do
PostgreSQL rodando:

```bash
npm ci
npm test              # 2 suítes, 23 testes
npm run test:coverage # falha se a cobertura ficar abaixo de 90%
npm run lint          # tsc --noEmit + eslint
```

Para conferir a API de ponta a ponta, suba o banco e a API (Opção 2 acima) e faça:

```bash
curl localhost:3000/health   # {"status":"ok","timestamp":"..."}
curl -X POST localhost:3000/produtos -H 'content-type: application/json' \
  -d '{"nome":"Dipirona","descricao":"Analgésico","preco":12.5}'
curl localhost:3000/produtos
```

Com Podman em vez de Docker, `podman-compose up db -d` funciona do mesmo jeito. Já o serviço
`api` do compose não sobe em hosts com SELinux (Fedora, por exemplo): o volume `.:/app` fica sem
permissão de leitura (`EACCES` em `/app/package.json`). Nesse caso, use a Opção 2. O
`.env.example` traz `DB_HOST=db`, mas funciona fora do contêiner porque a conexão usa o
`DATABASE_URL`, que aponta para `localhost`.

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

## Infraestrutura com Vagrant

O `Vagrantfile` cria duas VMs Ubuntu 24.04 no provedor VirtualBox:

| VM | Função | Memória | IP privado (Classe C) |
|----|--------|---------|-----------------------|
| `vm1` | Cliente para testar a API | 1024 MB | `192.168.56.10` |
| `vm2` | API Node.js + PostgreSQL | 2048 MB | `192.168.56.11` |

Na `vm2`, a pasta do projeto é sincronizada em `/vagrant_data`. O provisionamento instala o Node.js 20 e o PostgreSQL, cria o banco, compila a aplicação e a executa como o serviço `clinica-api`, na porta 3000.

### Pré-requisitos

- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- [Vagrant](https://developer.hashicorp.com/vagrant/install)

O VirtualBox 7.2 exige o Vagrant 2.4.9 ou mais recente. No Linux, os módulos `vboxdrv`, `vboxnetadp` e `vboxnetflt` precisam estar carregados (`sudo modprobe -a vboxdrv vboxnetadp vboxnetflt`).

### Passo a passo

1. Na raiz do repositório, suba as duas VMs (a primeira execução baixa a imagem e instala as dependências):
   ```bash
   vagrant up
   ```

2. Confira se as duas aparecem como `running`:
   ```bash
   vagrant status
   ```

3. Entre na VM1:
   ```bash
   vagrant ssh vm1
   ```

4. Dentro da VM1, teste a rota GET da API que está na VM2, com `curl`:
   ```bash
   curl -i http://192.168.56.11:3000/produtos
   ```

   Ou com `wget`:
   ```bash
   wget -qO- http://192.168.56.11:3000/produtos
   ```

   A resposta esperada é `200 OK` com os produtos de exemplo do `init.sql`:
   ```json
   [
     {
       "id": 1,
       "nome": "Dipirona 500mg",
       "descricao": "Analgésico e antitérmico",
       "preco": "12.50",
       "criado_em": "2026-08-31T00:00:00.000Z"
     },
     {
       "id": 2,
       "nome": "Paracetamol 750mg",
       "descricao": "Analgésico",
       "preco": "8.90",
       "criado_em": "2026-08-31T00:00:00.000Z"
     }
   ]
   ```

5. Saia da VM1 com `exit`. Para desligar ou remover as VMs:
   ```bash
   vagrant halt      # desliga
   vagrant destroy -f  # remove
   ```

Para ver os logs da API, rode `vagrant ssh vm2 -c "journalctl -u clinica-api -n 50"`. Depois de alterar o código, `vagrant reload vm2` recompila e reinicia a aplicação.

## Workflow de Git escolhido: GitHub Flow

A partir desta entrega o projeto usa **GitHub Flow** (a fase anterior usava Gitflow com `main + develop`; o histórico antigo foi mantido).

### Por que GitHub Flow?

1. **Simplicidade**: só `main` (produção) + branches curtas `feature/*` / `docs/*` + Pull Request.
2. **CI como portão**: nenhum merge entra sem `Quality` verde (build + lint + testes + cobertura >=90%).
3. **Commits assinados obrigatórios**: todo commit é `-S` (GPG) e a proteção exige assinatura verificada.
4. **Alternância de autores**: commits alternados entre Bryan Belo e Raul Holanda Lopes, mantendo o padrão `feat:/test:/ci:/docs:`.

### Estrutura de branches do projeto (fase atual)

```
main (produção, baseline, protegida)
  └── develop (integração, protegida)
        ├── feature/docker-ci-cd            # CI/CD: build Docker + publish DockerHub + badges (Bryan e Raul)
        ├── fix/sonarqube-analysis          # 13 correções SonarQube / Clean Code
        ├── feature/get-produto-by-id       # GET /produtos/:id (Bryan)
        ├── feature/delete-produtos         # DELETE /produtos/:id (Raul)
        ├── feature/testes-novos-endpoints  # testes 404/204, 100% cobertura (Bryan)
        ├── feature/quality-workflow        # quality.yml + eslint (Raul)
        └── docs/github-flow-assinatura     # este trecho do README (Bryan)
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

- `main` (produção):
  - [x] `Require a pull request before merging` (mín. 1 approval, `Dismiss stale approvals`)
  - [x] `Require status checks before merging` → exigir `Quality / Qualidade (testes, cobertura e linter)`
  - [x] `Require signed commits` (ou `Require verified signatures` — todos os commits `-S`)
  - [x] `Do not allow bypassing the above settings`
  - [x] `Restrict who can push` (só via PR, sem push direto)
- `develop` (homologação/integração, estilo já em uso):
  - [x] `Require a pull request before merging`
  - [x] `Require status checks before merging` → exigir `Quality`
- Fluxo: `feature/*` → PR → `develop` (validação) → PR → `main` (deploy).

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

3. **`Quality & Docker CI/CD` (`.github/workflows/quality.yml`) — Pipeline da Baseline**:
   - **Gatilho**: `push` em qualquer branch (`**`) + `pull_request` para `main` e `develop`.
   - **Jobs automatizados**:
     - **`Qualidade (testes, cobertura e linter)`**:
       - Instala dependências limpas (`npm ci --ignore-scripts`);
       - Compila TypeScript (`npm run build`);
       - Executa verificação de linter e tipos (`npm run lint`);
       - Executa testes unitários com Jest e valida cobertura mínima de 90% (`npm run test:coverage`).
     - **`Construção da Imagem Docker`**:
       - Executado em **qualquer branch** a cada modificação (`push`/`PR`);
       - Constrói o contêiner via `docker/build-push-action` sem efetuar push, garantindo a integridade do `Dockerfile`.
     - **`Publicação da Imagem no DockerHub`**:
       - Executado **apenas quando houver mudança na baseline (`main`)** via push direto ou merge de PR;
       - Autentica no DockerHub usando segredos (`DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN`);
       - Constrói e publica as tags `:latest` e `:<commit-sha>` no repositório oficial [bryanbelo/clinica-medica-gc2](https://hub.docker.com/r/bryanbelo/clinica-medica-gc2).

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
├── provision/
│   ├── vm2-dependencias.sh     # Instala Node.js e PostgreSQL e prepara o banco na VM2
│   └── vm2-aplicacao.sh        # Compila e executa a API na VM2
├── Vagrantfile                 # VMs vm1 e vm2 no VirtualBox
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── jest.config.ts              # Configuração do Jest com threshold de 90%
├── package.json
└── tsconfig.json
```
