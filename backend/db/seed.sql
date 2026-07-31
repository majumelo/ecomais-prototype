-- =========================================================
-- Ecomais — Dados de teste (seed)
-- Rode depois do schema.sql:
--   psql -d eco_mais -f seed.sql
--
-- IDs fixos de propósito (em vez de gen_random_uuid()) para
-- que você consiga referenciar os mesmos registros em testes
-- manuais, no Postman/Insomnia, etc.
-- =========================================================

-- ---------------------------------------------------------
-- Bairros (US1.1 — horário de coleta)
-- Coordenadas de referência: Cuité, PB
-- ---------------------------------------------------------
INSERT INTO bairros (id, nome, dias_coleta, horario_previsto) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Centro',            '{seg,qua,sex}', '06:30'),
  ('22222222-2222-2222-2222-222222222222', 'São José',          '{ter,qui,sab}', '07:00'),
  ('33333333-3333-3333-3333-333333333333', 'Presidente Vargas', '{seg,qua,sex}', '08:00');

-- ---------------------------------------------------------
-- Pontos de coleta (US2.1 — mapa interativo)
-- ---------------------------------------------------------
INSERT INTO pontos_coleta (id, nome, latitude, longitude, tipo_residuo, bairro_id) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Praça da Matriz',          -6.4858, -36.1519, 'reciclavel', '11111111-1111-1111-1111-111111111111'),
  ('a2222222-2222-2222-2222-222222222222', 'Mercado Público',          -6.4864, -36.1526, 'organico',   '11111111-1111-1111-1111-111111111111'),
  ('a3333333-3333-3333-3333-333333333333', 'Rua Manoel Marinho',       -6.4820, -36.1490, 'reciclavel', '22222222-2222-2222-2222-222222222222'),
  ('a4444444-4444-4444-4444-444444444444', 'Rua Otacílio de Oliveira', -6.4890, -36.1550, 'organico',   '33333333-3333-3333-3333-333333333333');

-- ---------------------------------------------------------
-- Motoristas
-- Login demo (tela "Motorista" no app):
--   e-mail: joao@ecomais.com   | senha: motorista123
--   e-mail: maria@ecomais.com  | senha: motorista123
-- (hash gerado com pgcrypto/bcrypt, já habilitado no schema.sql)
-- ---------------------------------------------------------
INSERT INTO motoristas (id, nome, telefone, email, senha_hash, ativo) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'João da Silva',   '(83) 99999-0001', 'joao@ecomais.com',  crypt('motorista123', gen_salt('bf')), true),
  ('d2222222-2222-2222-2222-222222222222', 'Maria das Neves', '(83) 99999-0002', 'maria@ecomais.com', crypt('motorista123', gen_salt('bf')), true);

-- ---------------------------------------------------------
-- Caminhões (associados à rota/bairro do dia)
-- ---------------------------------------------------------
INSERT INTO caminhoes (id, identificador, motorista_id, bairro_id, ativo) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'ECM-1A23', 'd1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', true),
  ('c2222222-2222-2222-2222-222222222222', 'ECM-2B47', 'd2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', true);

-- ---------------------------------------------------------
-- Posições de GPS (US3.1 — histórico simples para o caminhão
-- ECM-1A23 "andando" pelo Centro; a view vw_ultima_posicao_caminhao
-- sempre pega a mais recente de cada caminhão)
-- ---------------------------------------------------------
INSERT INTO posicoes_gps (caminhao_id, latitude, longitude, registrado_em) VALUES
  ('c1111111-1111-1111-1111-111111111111', -6.4870, -36.1530, now() - interval '6 minutes'),
  ('c1111111-1111-1111-1111-111111111111', -6.4865, -36.1524, now() - interval '4 minutes'),
  ('c1111111-1111-1111-1111-111111111111', -6.4861, -36.1521, now() - interval '2 minutes'),
  ('c1111111-1111-1111-1111-111111111111', -6.4858, -36.1519, now()),
  ('c2222222-2222-2222-2222-222222222222', -6.4820, -36.1490, now());

-- ---------------------------------------------------------
-- Administrador de teste (login do painel interno)
-- usuário: admin@ecomais.com | senha: ecomais123
-- (hash gerado com pgcrypto/bcrypt, já habilitado no schema.sql)
-- ---------------------------------------------------------
INSERT INTO administradores (id, nome, email, senha_hash) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Admin Ecomais', 'admin@ecomais.com', crypt('ecomais123', gen_salt('bf')));
