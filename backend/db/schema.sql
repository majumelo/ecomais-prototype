-- =========================================================
-- Ecomais — Schema do banco de dados (PostgreSQL)
-- Sistema de Monitoramento de Coleta
--
-- Banco de destino: eco_mais
-- Execução local:
--   createdb eco_mais
--   psql -d eco_mais -f schema.sql
--   psql -d eco_mais -f seed.sql
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- necessária para gen_random_uuid()

-- ---------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------
CREATE TYPE dia_semana AS ENUM ('seg','ter','qua','qui','sex','sab','dom');
CREATE TYPE tipo_residuo AS ENUM ('reciclavel','organico','geral');

-- ---------------------------------------------------------
-- Função utilitária: mantém updated_at sempre atual
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- bairros — usado pela tela "Horário de Coleta" (US1.1/US1.2)
-- e como referência para pontos e caminhões
-- ---------------------------------------------------------
CREATE TABLE bairros (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              VARCHAR(120) NOT NULL UNIQUE,
  dias_coleta       dia_semana[] NOT NULL,
  horario_previsto  TIME NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_bairros_updated_at
BEFORE UPDATE ON bairros
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- pontos_coleta — usado pela tela "Mapa Interativo" (US2.1/US2.2)
-- ---------------------------------------------------------
CREATE TABLE pontos_coleta (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          VARCHAR(150) NOT NULL,
  latitude      NUMERIC(9,6) NOT NULL,
  longitude     NUMERIC(9,6) NOT NULL,
  tipo_residuo  tipo_residuo NOT NULL,
  bairro_id     UUID NOT NULL REFERENCES bairros(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pontos_coleta_bairro ON pontos_coleta(bairro_id);

CREATE TRIGGER trg_pontos_coleta_updated_at
BEFORE UPDATE ON pontos_coleta
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- motoristas — quem opera o caminhão (apoio à US3.2)
-- ---------------------------------------------------------
CREATE TABLE motoristas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(150) NOT NULL,
  telefone    VARCHAR(20),
  email       VARCHAR(150) NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_motoristas_updated_at
BEFORE UPDATE ON motoristas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- caminhoes — usado pela tela "GPS ao Vivo" (US3.1/US3.2)
-- ---------------------------------------------------------
CREATE TABLE caminhoes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador  VARCHAR(50) NOT NULL UNIQUE, -- placa ou código interno
  motorista_id   UUID REFERENCES motoristas(id) ON DELETE SET NULL,
  bairro_id      UUID REFERENCES bairros(id) ON DELETE SET NULL, -- rota do dia
  ativo          BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_caminhoes_bairro ON caminhoes(bairro_id);
CREATE INDEX idx_caminhoes_motorista ON caminhoes(motorista_id);

CREATE TRIGGER trg_caminhoes_updated_at
BEFORE UPDATE ON caminhoes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- posicoes_gps — histórico de localização em tempo real (US3.1)
-- cada linha nova = uma atualização de posição enviada pelo
-- dispositivo/app do motorista
-- ---------------------------------------------------------
CREATE TABLE posicoes_gps (
  id            BIGSERIAL PRIMARY KEY,
  caminhao_id   UUID NOT NULL REFERENCES caminhoes(id) ON DELETE CASCADE,
  latitude      NUMERIC(9,6) NOT NULL,
  longitude     NUMERIC(9,6) NOT NULL,
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consulta mais comum do sistema: "última posição de cada caminhão"
CREATE INDEX idx_posicoes_gps_caminhao_tempo ON posicoes_gps(caminhao_id, registrado_em DESC);

-- ---------------------------------------------------------
-- administradores — equipe interna da Ecomais (painel admin,
-- fora do escopo do MVP público, mas necessário desde já para
-- que vocês cadastrem bairros/pontos/horários sem mexer no banco)
-- ---------------------------------------------------------
CREATE TABLE administradores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  senha_hash   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_administradores_updated_at
BEFORE UPDATE ON administradores
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- View auxiliar: última posição conhecida de cada caminhão,
-- já com o nome do bairro — é isso que a tela de GPS ao vivo
-- (e o endpoint /api/caminhoes/posicoes) consome
-- ---------------------------------------------------------
CREATE VIEW vw_ultima_posicao_caminhao AS
SELECT DISTINCT ON (p.caminhao_id)
  p.caminhao_id,
  c.identificador AS placa,
  c.bairro_id,
  b.nome AS bairro_nome,
  p.latitude,
  p.longitude,
  p.registrado_em
FROM posicoes_gps p
JOIN caminhoes c ON c.id = p.caminhao_id
LEFT JOIN bairros b ON b.id = c.bairro_id
ORDER BY p.caminhao_id, p.registrado_em DESC;
