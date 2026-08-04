# Sua Cidade — Portal do Município (protótipo)

Portal do município inspirado no [minhacidade.conectagov.com.br](https://www.minhacidade.conectagov.com.br/),
com uma landing page listando os serviços: **Meu Lixo** (o app Ecomais,
totalmente funcional), **Minha Educação**, **Minha Saúde** e **Minha
Cidadania** (essas três ainda "Em breve" — só a tela placeholder existe).

Dentro de **Meu Lixo**: **Horário de Coleta**, **Mapa Interativo**, **GPS ao
Vivo do Caminhão** e uma aba única de **Login**, que reconhece pelo e-mail se
quem entrou é motorista (mostra a sessão dele) ou admin (mostra o painel
administrativo). Dados de teste referentes a Cuité, PB.

Stack: React + TypeScript + Vite + Leaflet no frontend, Node/Express no
backend, PostgreSQL no banco `eco_mais`.

## Estrutura

```
backend/
  db/
    schema.sql          # cria todas as tabelas do sistema
    seed.sql            # dados de teste (bairros, pontos, caminhões, GPS, serviços do portal)
  src/
    config/
      db.js               # pool de conexão com o Postgres
    middlewares/
      auth.js              # sessão de admin em memória + middleware requireAdmin
    controllers/           # regra de negócio de cada recurso (bairros, pontosColeta,
                            # caminhoes, motoristas, administradores, servicosPortal)
    routes/                # um router por recurso + index.js que monta tudo em /api
    app.js                 # configuração do Express (cors, json, rotas)
  index.js               # ponto de entrada: sobe o app.js na porta configurada
  .env                    # DATABASE_URL/PORT reais (não versionado)
  .env.example            # copie para .env e ajuste a DATABASE_URL
frontend/
  index.html
  src/
    App.tsx              # roteador do portal (hash routing: #/meu-lixo etc.),
                          # busca os serviços em /api/servicos ao montar
    api.ts                # chamadas fetch para a API do Ecomais
    index.css             # tokens de design (paleta do portal + paleta do Ecomais)
    components/
      portal/
        Navbar.tsx         # topo azul com os serviços do município (vindos da API)
        LandingPage.tsx    # cards de serviço da home ("Sua Cidade")
        EmBreve.tsx         # placeholder das seções ainda não construídas
      EcomaisApp.tsx        # shell do "Meu Lixo" (abas + botão voltar pro portal)
      HorarioColeta.tsx     # US1.1 — consulta de horário por bairro
      MapaInterativo.tsx    # US2.1 — mapa com pontos de coleta
      GpsCaminhao.tsx        # US3.1 — posição do caminhão em tempo real
      Login.tsx               # US3.2 — login único (detecta motorista x admin)
                               # e, se admin, o CRUD de bairros/pontos/motoristas/
                               # caminhões/serviços do portal
```

Os dados dos cards da landing page (Meu Lixo, Minha Educação...) ficam na
tabela `servicos_portal` — não tem mais nenhuma lista fixa no `.ts` do
frontend; tudo que é "conteúdo" mora no banco, e o React só busca e renderiza.

## Como rodar tudo localmente

### 1. Banco de dados

```bash
createdb eco_mais
psql -d eco_mais -f backend/db/schema.sql
psql -d eco_mais -f backend/db/seed.sql
```

Isso cria as tabelas (`bairros`, `pontos_coleta`, `motoristas`, `caminhoes`,
`posicoes_gps`, `administradores`, `servicos_portal`) e já popula com 3
bairros de teste (Centro, São José, Presidente Vargas — coordenadas de
Cuité, PB), pontos de coleta, 2 caminhões, 2 motoristas com login, os 4
serviços do portal e algumas posições de GPS.

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
- `GET /api/servicos` — cards da landing page "Sua Cidade" (id, nome, emoji,
  descrição, disponível)
- CRUD protegido por token de admin: `/api/bairros`, `/api/pontos-coleta`,
  `/api/motoristas`, `/api/caminhoes`, `/api/servicos` (`POST`/`PUT`/`DELETE`;
  `GET` de motoristas e caminhões também exige admin)

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

## Deploy (grátis, já no ar)

- **Banco**: Neon (Postgres serverless grátis) — mesmo schema/seed do local.
- **Backend**: Render Web Service (free) — `backend/`, variáveis
  `DATABASE_URL` (connection string do Neon) e `PORT`.
- **Frontend**: Render Static Site (free) — `frontend/`, variável
  `VITE_API_URL` apontando pra URL pública do backend, build
  `npm install && npm run build`, publish dir `dist`.

No plano free do Render, o backend "dorme" depois de ~15 min sem uso — a
primeira requisição depois disso demora uns 30-50s pra acordar.

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
- [x] Landing page "Sua Cidade" com navbar e cards para os 4 serviços do
      município (Meu Lixo funcional; os outros três com tela "Em breve")

## Próximos passos sugeridos (retomar no Claude Code)

1. **Construir Minha Educação / Minha Saúde / Minha Cidadania**: hoje são só
   a tela "Em breve" (`frontend/src/components/portal/EmBreve.tsx`), controlada
   pela linha correspondente em `servicos_portal` (`disponivel = false`). O
   padrão pra criar uma dessas de verdade é o mesmo do Ecomais: uma(s) tabela(s)
   nova(s) no Postgres, um controller + router próprios em `backend/src/`,
   registrados em `backend/src/routes/index.js`, e um shell tipo `EcomaisApp.tsx`
   plugado no roteador (`App.tsx`) no lugar do `EmBreve` — depois é só marcar
   `disponivel = true` no serviço.
2. **GPS real**: com o motorista logado, o celular dele (via app/PWA) passa a
   inserir uma nova linha em `posicoes_gps` a cada poucos segundos, usando o
   `caminhaoId` retornado no login — troque o polling do frontend por
   WebSocket se o número de caminhões crescer.
3. **Autenticação de verdade**: hoje o login do motorista não emite token e o
   token de admin é um UUID guardado em memória no servidor
   (`backend/src/middlewares/auth.js`) — para produção, trocar por JWT/sessão
   assinada e persistida (Redis, tabela de sessões, etc.), já que reiniciar o
   backend derruba todo mundo logado.

## Onde editar cada coisa

- Adicionar bairro/ponto/caminhão de teste → `backend/db/seed.sql` (rode de novo com
  `psql -d eco_mais -f backend/db/seed.sql`, apagando os dados antigos se precisar)
- Mudar cores/fontes → `frontend/src/index.css`
- Adicionar um novo endpoint → crie o controller em `backend/src/controllers/`,
  o router em `backend/src/routes/` e registre em `backend/src/routes/index.js`
- Adicionar/editar um serviço do portal (Meu Lixo, Minha Educação...) → aba
  "Serviços" do painel admin, ou direto na tabela `servicos_portal`
- Adicionar uma aba dentro do Ecomais (Meu Lixo) → `frontend/src/components/EcomaisApp.tsx`
  (array `ABAS`) + novo componente
- Adicionar/trocar motorista → aba "Motoristas" do painel admin, ou
  `backend/db/seed.sql` (o hash de senha usa `crypt()`/`pgcrypto`)

Peça para o Claude Code continuar a partir daqui — a estrutura reflete o
backlog do `docs/01_SCRUM.md`, então cada Sprint tem um ponto claro de entrada
no código.
