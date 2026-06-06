CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo_negocio VARCHAR(80) NOT NULL,
  documento VARCHAR(30),
  telefone VARCHAR(30),
  endereco TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(30) DEFAULT 'ADMIN',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(30),
  email VARCHAR(150),
  documento VARCHAR(30),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profissionais (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(30),
  email VARCHAR(150),
  funcao VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servicos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL,
  valor DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  profissional_id INTEGER REFERENCES profissionais(id) ON DELETE SET NULL,
  servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL,
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status VARCHAR(30) DEFAULT 'AGENDADO',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assinaturas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
  plano VARCHAR(40) NOT NULL DEFAULT 'starter',
  status VARCHAR(30) NOT NULL DEFAULT 'ATIVA',
  valor_mensal DECIMAL(10,2) DEFAULT 59.00,
  ciclo VARCHAR(20) DEFAULT 'MENSAL',
  provider VARCHAR(40) DEFAULT 'MERCADO_PAGO',
  external_reference VARCHAR(120),
  mercado_pago_preapproval_id VARCHAR(120),
  checkout_url TEXT,
  inicio_em DATE DEFAULT CURRENT_DATE,
  proxima_cobranca DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')::date,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS provider VARCHAR(40) DEFAULT 'MERCADO_PAGO';
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS external_reference VARCHAR(120);
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS mercado_pago_preapproval_id VARCHAR(120);
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS checkout_url TEXT;

INSERT INTO assinaturas (empresa_id)
SELECT id FROM empresas
WHERE NOT EXISTS (
  SELECT 1 FROM assinaturas WHERE assinaturas.empresa_id = empresas.id
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_empresa_data
  ON agendamentos (empresa_id, data_agendamento);

CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_data
  ON agendamentos (profissional_id, data_agendamento);
