-- Esquema relacional sugerido para o protótipo ZARC
-- Dialeto: PostgreSQL (ajuste tipos/ENUMs conforme necessário)

-- =========================================================
-- 1. Tipos auxiliares (ENUMs)
-- =========================================================

CREATE TYPE tipo_produtor_enum AS ENUM ('Proprietario', 'Arrendatario');

CREATE TYPE tipo_matricula_enum AS ENUM ('Cooperado', 'NaoCooperado');

CREATE TYPE status_solicitacao_enum AS ENUM (
  'EM_ELABORACAO',
  'EM_REVISAO',
  'PRONTA_ENVIO',
  'ENVIADA',
  'RET_SUCESSO',
  'RET_ERRO'
);

CREATE TYPE status_analise_enum AS ENUM ('Pendente', 'EmAnalise', 'Concluida');

CREATE TYPE ambiente_envio_enum AS ENUM ('Homologacao', 'Producao');

CREATE TYPE status_integracao_enum AS ENUM ('SUCESSO', 'ERRO');

CREATE TYPE ilp_enum AS ENUM ('Sim', 'Nao');

-- =========================================================
-- 2. Cadastros básicos
-- =========================================================

CREATE TABLE produtor (
  id_produtor         SERIAL PRIMARY KEY,
  cpf_cnpj            VARCHAR(20) NOT NULL UNIQUE,
  nome                VARCHAR(150) NOT NULL,
  tipo_produtor       tipo_produtor_enum NOT NULL,
  tipo_matricula      tipo_matricula_enum NOT NULL,
  matricula           VARCHAR(30) NOT NULL
);

CREATE INDEX idx_produtor_matricula ON produtor (matricula);

CREATE TABLE propriedade (
  id_propriedade      SERIAL PRIMARY KEY,
  id_produtor         INTEGER NOT NULL REFERENCES produtor (id_produtor),
  car                 VARCHAR(30) NOT NULL UNIQUE,
  nome                VARCHAR(150) NOT NULL,
  municipio           VARCHAR(100) NOT NULL,
  codigo_ibge         VARCHAR(7) NOT NULL,
  -- geometria opcional do CAR (ajustar tipo para PostGIS se usar)
  geom_car            TEXT
);

CREATE TABLE talhao (
  id_talhao           SERIAL PRIMARY KEY,
  id_propriedade      INTEGER NOT NULL REFERENCES propriedade (id_propriedade),
  nome                VARCHAR(100),
  area_ha             NUMERIC(10,2) NOT NULL,
  cultura             VARCHAR(80),
  data_plantio        DATE,
  safra               VARCHAR(20),
  projeto_custeio     VARCHAR(30),
  plantio_em_contorno BOOLEAN NOT NULL DEFAULT FALSE,
  -- geometria opcional do talhão
  geom_talhao         TEXT
);

-- =========================================================
-- 3. Projeto de custeio
-- =========================================================

CREATE TABLE projeto_custeio (
  id_projeto          SERIAL PRIMARY KEY,
  numero_projeto      VARCHAR(30) NOT NULL,
  safra               VARCHAR(20) NOT NULL,
  id_produtor         INTEGER NOT NULL REFERENCES produtor (id_produtor),
  tipo_matricula      tipo_matricula_enum NOT NULL,
  matricula           VARCHAR(30) NOT NULL,
  nome_produtor       VARCHAR(150) NOT NULL,
  CONSTRAINT uq_projeto_numero UNIQUE (numero_projeto)
);

CREATE TABLE talhao_projeto_custeio (
  id_talhao_projeto   SERIAL PRIMARY KEY,
  id_talhao           INTEGER NOT NULL REFERENCES talhao (id_talhao),
  id_projeto          INTEGER NOT NULL REFERENCES projeto_custeio (id_projeto),
  CONSTRAINT uq_talhao_projeto UNIQUE (id_talhao, id_projeto)
);

-- =========================================================
-- 4. Solicitação ZARC e validações
-- =========================================================

CREATE TABLE solicitacao_zarc (
  id_solicitacao              SERIAL PRIMARY KEY,
  codigo_externo              VARCHAR(20) NOT NULL, -- ex: "000123"
  id_talhao                   INTEGER NOT NULL REFERENCES talhao (id_talhao),
  id_projeto                  INTEGER REFERENCES projeto_custeio (id_projeto),
  status                      status_solicitacao_enum NOT NULL,
  data_solicitacao            DATE NOT NULL,
  agronomo_responsavel        VARCHAR(150) NOT NULL,

  -- flags de validação (espelham o front-end)
  produtor_identificado       BOOLEAN NOT NULL DEFAULT FALSE,
  car_selecionado             BOOLEAN NOT NULL DEFAULT FALSE,
  talhao_dentro_car           BOOLEAN NOT NULL DEFAULT FALSE,
  cultura_validada            BOOLEAN NOT NULL DEFAULT FALSE,
  data_plantio_informada      BOOLEAN NOT NULL DEFAULT FALSE,
  analise_solo_vinculada      BOOLEAN NOT NULL DEFAULT FALSE,
  manejos_cadastrados         BOOLEAN NOT NULL DEFAULT FALSE,
  cobertura_solo_informada    BOOLEAN NOT NULL DEFAULT FALSE,
  historico_produtivo_informado BOOLEAN NOT NULL DEFAULT FALSE,
  plantio_contorno_informado  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_solicitacao_status ON solicitacao_zarc (status);
CREATE INDEX idx_solicitacao_data   ON solicitacao_zarc (data_solicitacao);

-- =========================================================
-- 5. Análises de solo
-- =========================================================

CREATE TABLE analise_solo (
  id_analise          SERIAL PRIMARY KEY,
  id_talhao           INTEGER NOT NULL REFERENCES talhao (id_talhao),
  data_coleta         DATE NOT NULL,
  camada              VARCHAR(20) NOT NULL,
  argila              VARCHAR(20),
  p                   VARCHAR(20),
  k                   VARCHAR(20),
  ca                  VARCHAR(20),
  mg                  VARCHAR(20),
  lat                 NUMERIC(10,6),
  lng                 NUMERIC(10,6)
);

-- vínculo opcional entre solicitação e análises selecionadas
CREATE TABLE solicitacao_analise_solo (
  id_solicitacao      INTEGER NOT NULL REFERENCES solicitacao_zarc (id_solicitacao),
  id_analise          INTEGER NOT NULL REFERENCES analise_solo (id_analise),
  PRIMARY KEY (id_solicitacao, id_analise)
);

-- =========================================================
-- 6. Manejo, cobertura e histórico produtivo
-- =========================================================

CREATE TABLE manejo (
  id_manejo           SERIAL PRIMARY KEY,
  id_solicitacao      INTEGER NOT NULL REFERENCES solicitacao_zarc (id_solicitacao),
  operacao            VARCHAR(40) NOT NULL, -- Aração, Gradagem, Subsolagem, Escarificação...
  tipo                VARCHAR(80),
  data                DATE
);

CREATE TABLE cobertura_solo (
  id_cobertura        SERIAL PRIMARY KEY,
  id_solicitacao      INTEGER NOT NULL REFERENCES solicitacao_zarc (id_solicitacao),
  percentual_palhada  NUMERIC(5,2) NOT NULL,
  data_avaliacao      DATE NOT NULL
);

CREATE TABLE historico_producao (
  id_historico        SERIAL PRIMARY KEY,
  id_solicitacao      INTEGER NOT NULL REFERENCES solicitacao_zarc (id_solicitacao),
  cultura_anterior    VARCHAR(80) NOT NULL,
  data_plantio        DATE NOT NULL,
  data_colheita       DATE NOT NULL,
  ilp                 ilp_enum NOT NULL
);

-- =========================================================
-- 7. Resultado da análise ZARC
-- =========================================================

CREATE TABLE resultado_zarc (
  id_resultado        SERIAL PRIMARY KEY,
  id_solicitacao      INTEGER NOT NULL UNIQUE REFERENCES solicitacao_zarc (id_solicitacao),
  status_analise      status_analise_enum NOT NULL,
  classificacao_risco VARCHAR(120) NOT NULL,
  janela_plantio      VARCHAR(80) NOT NULL,
  indice_aptidao      INTEGER NOT NULL,
  recomendacao_tecnica TEXT
);

-- =========================================================
-- 8. Integração ZARC
-- =========================================================

CREATE TABLE integracao_zarc (
  id_integracao           SERIAL PRIMARY KEY,
  id_solicitacao          INTEGER NOT NULL REFERENCES solicitacao_zarc (id_solicitacao),
  ambiente_envio          ambiente_envio_enum NOT NULL,
  versao_layout           VARCHAR(20) NOT NULL,
  datahora_prevista_envio TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  usuario_responsavel_envio VARCHAR(150) NOT NULL,
  status_integracao       status_integracao_enum,
  protocolo               VARCHAR(60),
  mensagem_retorno        TEXT,
  datahora_envio_efetivo  TIMESTAMP WITHOUT TIME ZONE
);

