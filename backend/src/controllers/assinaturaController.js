const pool = require("../config/database");

const PLANOS = {
  starter: {
    plano: "starter",
    nome: "Essencial",
    valor_mensal: 59,
    limites: {
      usuarios: 3,
      profissionais: 3,
      agendamentos_mes: 120
    }
  },
  professional: {
    plano: "professional",
    nome: "Profissional",
    valor_mensal: 119,
    limites: {
      usuarios: 10,
      profissionais: 15,
      agendamentos_mes: 800
    }
  },
  business: {
    plano: "business",
    nome: "Empresarial",
    valor_mensal: 0,
    limites: {
      usuarios: null,
      profissionais: null,
      agendamentos_mes: null
    }
  }
};

async function buscarOuCriarAssinatura(empresaId) {
  const existente = await pool.query(
    "SELECT * FROM assinaturas WHERE empresa_id = $1",
    [empresaId]
  );

  if (existente.rows[0]) {
    return existente.rows[0];
  }

  const criada = await pool.query(
    `INSERT INTO assinaturas (empresa_id, plano, valor_mensal)
     VALUES ($1, 'starter', $2)
     RETURNING *`,
    [empresaId, PLANOS.starter.valor_mensal]
  );

  return criada.rows[0];
}

async function obter(req, res) {
  const assinatura = await buscarOuCriarAssinatura(req.usuario.empresa_id);
  const plano = PLANOS[assinatura.plano] || PLANOS.starter;

  res.json({
    ...assinatura,
    nome: plano.nome,
    limites: plano.limites,
    planos: Object.values(PLANOS)
  });
}

async function atualizar(req, res) {
  const { plano } = req.body;
  const planoEscolhido = PLANOS[plano];

  if (!planoEscolhido) {
    return res.status(400).json({ mensagem: "Plano invalido" });
  }

  const result = await pool.query(
    `INSERT INTO assinaturas (empresa_id, plano, valor_mensal)
     VALUES ($1, $2, $3)
     ON CONFLICT (empresa_id)
     DO UPDATE SET
       plano = EXCLUDED.plano,
       valor_mensal = EXCLUDED.valor_mensal,
       status = 'ATIVA',
       proxima_cobranca = (CURRENT_DATE + INTERVAL '30 days')::date,
       atualizado_em = CURRENT_TIMESTAMP
     RETURNING *`,
    [req.usuario.empresa_id, plano, planoEscolhido.valor_mensal]
  );

  res.json({
    ...result.rows[0],
    nome: planoEscolhido.nome,
    limites: planoEscolhido.limites
  });
}

module.exports = { obter, atualizar };
