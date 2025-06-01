# Eu Digital App API

Este repositório contém a **API RESTful** do projeto “Eu Digital App”, responsável pela ingestão de pacotes SIP e pelo CRUD completo de diversos tipos de itens (fotos, textos, resultados académicos, resultados desportivos, ficheiros e eventos).

---

## 🚀 Project Overview

* **Objetivo**: Gerir o “eu digital” do utilizador, permitindo:

  * Ingestão de *Submission Information Packages* (SIP) via upload de ZIP.
  * Armazenamento de metadados em MongoDB e ficheiros binários no filesystem.
  * Endpoints CRUD para todos os tipos de item.
  * Documentação automática com Swagger UI.
  * Testes automatizados de integração (Jest + Supertest).
  * Paginação e filtragem integradas nos endpoints de listagem (através de `page`, `limit` e filtros de consulta).

---

## 📋 Prerequisites

* **Docker & Docker Compose** (para MongoDB e Mongo Express):
  * Docker v20+ e Docker Compose (ou `docker compose` CLI v2).
* **Node.js** v16+ e npm v8+.

---

## ⚙️ Setup

1. **Configurar o MongoDB via Docker** (na raiz do projeto):

   ```bash
   cd ../docker
   docker compose up -d
   ```

   * MongoDB ficará acessível em `localhost:27017`.
   * Mongo Express UI em `http://localhost:8081` (usuário/password conforme `docker-compose.yml`).

2. **Instalar dependências**:

   ```bash
   cd api
   npm install
   ```

---

## ▶️ Running the API

Na pasta `api/`:

```bash
npm start
```

* Inicia o serviço em `http://localhost:3000`.
* As rotas principais são prefixadas por `/api`.

---

## 🛡  Autenticação & Autorização

### Registo de utilizador

- Endpoint: `POST /api/auth/register`

- Body (JSON):
   ```json
   {
   "username": "seuUsuario",
   "email": "seuemail@exemplo.com",
   "password": "suaSenha"
   }
   ```

- Responde com `{ user: { id, username, email }, token }`.

- Gera um **JWT** usando `JWT_SECRET`.

### Login de utilizador

- Endpoint: `POST /api/auth/login`

- Body (JSON):
   ```json
   {
   "emailOrUsername": "seuUsuarioOuEmail",
   "password": "suaSenha"
   }
   ```

- Responde com `{ user: { id, username, email }, token }`.

- `token` deve ser incluído no header `Authorization: Bearer <token>` em requisições protegidas.

### Proteção de rotas

- Os endpoints de criação, atualização e eliminação (`POST`, `PUT`, `DELETE`) exigem autenticação com JWT.

- Os endpoints de listagem e consulta de recursos (`GET`) aplicam regras de visibilidade:
  - **public**: qualquer um (sem token) vê.
  - **friends**: apenas utilizadores autenticados que constem na lista de amigos do dono.
  - **private**: apenas o próprio dono (ownerId) vê.

- Middleware `authenticate` verifica o token e anexa `req.user`.

- Middleware `authenticateOptional` tenta verificar token, mas permite acesso público caso não haja.

---

## ✅ Running Tests

Testes de integração com Jest + Supertest + MongoDB in-memory:

```bash
npm test
```

* Cobre todos os endpoints CRUD e a ingestão de pacotes.

---

## 📖 API Documentation

A especificação OpenAPI (Swagger) está em `api/docs/openapi.yaml`. Para aceder ao UI:

```
http://localhost:3000/api/docs 
```

---

## 📂 Project Structure

```
eu-digital-app/
├── api/
│   ├── app.js             # Configura Express e rotas
│   ├── server.js          # Inicializa o listener
|   ├── middleware/        # Autenticação JWT
│   ├── routes/            # Routers CRUD (photos, texts, …)
│   ├── services/          # IngestService (unzip, valida, store)
│   ├── models/            # Schemas Mongoose
│   ├── schemas/           # JSON Schema para manifesto-SIP
│   ├── tests/             # Jest + Supertest suites
│   ├── tmp/               # Pasta temporária de unzip (limpa-se)
│   └── storage/           # Ficheiros copiados organizados por data
│
├── docker/
│   └── docker-compose.yml # MongoDB + Mongo Express
│
├── docs/                  # Documentação do domínio e modelagem
└── README.md              
```

---

## 🔧 Componentes Criados

1. **User Model & Auth** (`models/User.js`, `routes/auth.js`, `middleware/auth.js`)

   * `User` schema Mongoose com `username`, `email`, `passwordHash` e lista `friends`.
   * Endpoints de register e login geram JWT.
   * Middleware para verificar token e permitir acesso condicional.

2. **Ingest Service** (`services/ingestService.js`)

   * Recebe ZIP, descompacta, valida manifesto JSON, copia ficheiros e insere documentos no Mongo.
   * Limpeza automática de ZIP e pasta temporária.

3. **Data Models** (`models/*.js`)

   * Schemas Mongoose para cada tipo de item.
   * Índices otimizados (`createdAt`, `tags`, etc.).

4. **Routers CRUD** (`routes/*.js`)

   * Endpoints `GET|POST|PUT|DELETE` para todos os recursos.
   * Paginação, filtros por query params.

5. **Documentação** (`docs/openapi.yaml`)

   * Especificação completa OpenAPI 3.0.
   * Swagger UI integrado via `swagger-ui-express`.

6. **Testes Automatizados** (`tests/*.test.js`)

   * Suites Jest + Supertest cobrindo todos os endpoints.
   * MongoDB in-memory para isolamento total.

7. **Docker Setup** (`docker/docker-compose.yml`)

   * MongoDB 6.0 e Mongo Express para administração via UI.