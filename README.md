# Ecomais — Protótipo Base

Protótipo funcional, agora ligado a um banco **PostgreSQL real**, das telas
definidas pelo sócio: **Horário de Coleta**, **Mapa Interativo**, **GPS ao Vivo
do Caminhão** e uma aba única de **Login**, que reconhece pelo e-mail se quem
entrou é motorista (mostra a sessão dele) ou admin (mostra o painel
administrativo). Dados de teste referentes a Cuité, PB.

Stack: React + TypeScript + Vite + Leaflet no frontend, Node/Express no
backend, PostgreSQL no banco `eco_mais`.

## Estrutura

```
backend/
  db/
    schema.sql          # cria todas as tabelas do sistema
    seed.sql            # dados de teste (3 bairros, pontos, caminhões, GPS)
  index.js               # API Express (3 endpoints, um por tela)
  db.js                  # conexão com o Postgres
  .env                    # DATABASE_URL/PORT reais (não versionado)
  .env.example            # copie para .env e ajuste a DATABASE_URL
frontend/
  index.html
  src/
    App.tsx              # navegação por abas (Horário / Mapa / Caminhão)
    api.ts                # chamadas fetch para a API (substitui o antigo mock.ts)
    index.css             # tokens de design (cores, tipografia)
    components/
      HorarioColeta.tsx   # US1.1 — consulta de horário por bairro
      MapaInterativo.tsx  # US2.1 — mapa com pontos de coleta
      GpsCaminhao.tsx      # US3.1 — posição do caminhão em tempo real
      Login.tsx             # US3.2 — login único (detecta motorista x admin)
                             # e, se admin, o CRUD de bairros/pontos/motoristas/caminhões
```

## Como rodar tudo localmente

### 1. Banco de dados

```bash
createdb eco_mais
psql -d eco_mais -f backend/db/schema.sql
psql -d eco_mais -f backend/db/seed.sql
```

Isso cria as tabelas (`bairros`, `pontos_coleta`, `motoristas`, `caminhoes`,
`posicoes_gps`, `administradores`) e já popula com 3 bairros de teste
(Centro, São José, Presidente Vargas — coordenadas de Cuité, PB), pontos de
coleta, 2 caminhões, 2 motoristas com login e algumas posições de GPS.

### 2. Backend (API)

```bash
cd backend
npm install
npm run dev
```

O `.env` já está configurado com usuário `postgres`, senha `Kdfm2020` e banco
`eco_mais` em `localhost:5432`. Ajuste se o seu Postgres local for diferente.

Sobe em `http://localhost:3333`. Endpoints:
- `GET /api/bairros` — usado pela tela de Horário
- `GET /api/pontos-coleta?tipo=reciclavel|organico` — usado pelo Mapa
- `GET /api/caminhoes/posicoes` — última posição de cada caminhão (GPS ao vivo)
- `POST /api/motoristas/login` — `{ email, senha }` → dados do motorista + caminhão vinculado
- `POST /api/administradores/login` — `{ email, senha }` → `{ token, admin }`
- `GET /api/administradores/me` — valida o token (header `Authorization: Bearer <token>`)
- `POST /api/administradores/logout` — invalida o token
- CRUD protegido por token de admin: `/api/bairros`, `/api/pontos-coleta`,
  `/api/motoristas`, `/api/caminhoes` (`POST`/`PUT`/`DELETE`; `GET` de
  motoristas e caminhões também exige admin)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. É mobile-first — use o modo responsivo do
DevTools (ou abra pelo celular na mesma rede) pra ver como fica de verdade.

### Login demo (aba "Login")

A aba é única — o mesmo formulário de e-mail/senha tenta primeiro como
motorista e, se não bater, tenta como admin. Depois de autenticado, a aba
"vira" a tela certa (sessão do motorista ou painel administrativo).

- Motorista: `joao@ecomais.com` / `motorista123` (caminhão `ECM-1A23`) ou
  `maria@ecomais.com` / `motorista123` (caminhão `ECM-2B47`)
- Admin: `admin@ecomais.com` / `ecomais123`

A sessão de motorista fica em `localStorage` (`ecomais_motorista`) — é essa
sessão que, no próximo passo, vai autorizar o celular do motorista a enviar a
localização em tempo real. A sessão de admin fica em `localStorage`
(`ecomais_admin`) com o token retornado pelo login; o painel permite
cadastrar/editar/excluir bairros, pontos de coleta, motoristas (incluindo
redefinir a senha de login deles) e caminhões (vinculando motorista + rota).
O token de admin vale até o backend reiniciar (sessão em memória — trocar por
JWT antes de produção).

## O que já está pronto (Sprint 0 + base de dados)

- [x] Estrutura do projeto e navegação entre as telas
- [x] Schema do banco com todas as tabelas necessárias (`backend/db/schema.sql`)
- [x] Dados de teste prontos para inserir (`backend/db/seed.sql`)
- [x] API mínima ligando o Postgres às telas (`backend/`)
- [x] Frontend consumindo a API de verdade (sem dado mockado em TS)
- [x] Consulta de horário por bairro
- [x] Mapa com pontos de coleta e filtro por tipo de resíduo
- [x] GPS ao vivo por polling (atualiza a cada 4s a partir do banco)
- [x] Login do motorista (`POST /api/motoristas/login`) com sessão local
- [x] Painel administrativo com login e CRUD de bairros, pontos de coleta,
      motoristas e caminhões

## Próximos passos sugeridos (retomar no Claude Code)

1. **GPS real**: com o motorista logado, o celular dele (via app/PWA) passa a
   inserir uma nova linha em `posicoes_gps` a cada poucos segundos, usando o
   `caminhaoId` retornado no login — troque o polling do frontend por
   WebSocket se o número de caminhões crescer.
2. **Autenticação de verdade**: hoje o login do motorista não emite token e o
   token de admin é um UUID guardado em memória no servidor (`adminTokens` em
   `backend/index.js`) — para produção, trocar por JWT/sessão assinada e
   persistida (Redis, tabela de sessões, etc.), já que reiniciar o backend
   derruba todo mundo logado.
3. **Deploy**: banco (ex.: Railway/Render/Supabase), backend (mesmo provedor
   ou similar) e frontend (Vercel/Netlify).

## Onde editar cada coisa

- Adicionar bairro/ponto/caminhão de teste → `backend/db/seed.sql` (rode de novo com
  `psql -d eco_mais -f backend/db/seed.sql`, apagando os dados antigos se precisar)
- Mudar cores/fontes → `frontend/src/index.css`
- Adicionar um novo endpoint → `backend/index.js`
- Adicionar uma nova aba → `frontend/src/App.tsx` (array `ABAS`) + novo componente
- Adicionar/trocar motorista → `backend/db/seed.sql` (o hash de senha usa `crypt()`/`pgcrypto`)

Peça para o Claude Code continuar a partir daqui — a estrutura reflete o
backlog do `docs/01_SCRUM.md`, então cada Sprint tem um ponto claro de entrada
no código.
