const pool = require("../config/database");
const { getPlan, listPlans } = require("../config/plans");

async function buscarOuCriarAssinatura(empresaId) {
  const existente = await pool.query("SELECT * FROM assinaturas WHERE empresa_id = $1", [empresaId]);

  if (existente.rows[0]) {
    return existente.rows[0];
  }

  const plano = getPlan("starter");
  const criada = await pool.query(
    `INSERT INTO assinaturas (empresa_id, plano, valor_mensal)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [empresaId, plano.plano, plano.valor_mensal]
  );

  return criada.rows[0];
}

async function obterUsoPlano(empresaId) {
  const [usuarios, profissionais, agendamentosMes] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE empresa_id = $1", [empresaId]),
    pool.query("SELECT COUNT(*)::int AS total FROM profissionais WHERE empresa_id = $1 AND ativo IS NOT FALSE", [
      empresaId
    ]),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM agendamentos
       WHERE empresa_id = $1
         AND criado_em >= date_trunc('month', CURRENT_DATE)
         AND criado_em < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
      [empresaId]
    )
  ]);

  return {
    usuarios: usuarios.rows[0].total,
    profissionais: profissionais.rows[0].total,
    agendamentos_mes: agendamentosMes.rows[0].total
  };
}

function montarAssinaturaComPlano(assinatura, uso) {
  const plano = getPlan(assinatura.plano);

  return {
    ...assinatura,
    nome: plano.nome,
    limites: plano.limites,
    uso,
    planos: listPlans()
  };
}

async function obterAssinaturaComUso(empresaId) {
  const [assinatura, uso] = await Promise.all([buscarOuCriarAssinatura(empresaId), obterUsoPlano(empresaId)]);
  return montarAssinaturaComPlano(assinatura, uso);
}

async function verificarLimiteDisponivel(empresaId, recurso) {
  const assinatura = await buscarOuCriarAssinatura(empresaId);
  const plano = getPlan(assinatura.plano);
  const limite = plano.limites[recurso];

  if (limite === null || limite === undefined) {
    return;
  }

  const uso = await obterUsoPlano(empresaId);

  if (uso[recurso] >= limite) {
    const error = new Error(`Limite do plano ${plano.nome} atingido para este recurso.`);
    error.statusCode = 402;
    error.code = "PLAN_LIMIT_REACHED";
    error.details = {
      recurso,
      limite,
      uso: uso[recurso],
      plano: plano.plano
    };
    throw error;
  }
}

module.exports = {
  buscarOuCriarAssinatura,
  obterUsoPlano,
  montarAssinaturaComPlano,
  obterAssinaturaComUso,
  verificarLimiteDisponivel
};
