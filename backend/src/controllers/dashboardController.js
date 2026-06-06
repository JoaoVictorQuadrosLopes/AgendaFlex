const pool = require("../config/database");

async function resumo(req, res) {
  const empresaId = req.usuario.empresa_id;

  const [hoje, semana, clientes, profissionais, faturamento, assinatura] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'CONFIRMADO')::int AS confirmados,
         COUNT(*) FILTER (WHERE status = 'CANCELADO')::int AS cancelados
       FROM agendamentos
       WHERE empresa_id = $1 AND data_agendamento = CURRENT_DATE`,
      [empresaId]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM agendamentos
       WHERE empresa_id = $1
         AND data_agendamento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`,
      [empresaId]
    ),
    pool.query("SELECT COUNT(*)::int AS total FROM clientes WHERE empresa_id = $1", [empresaId]),
    pool.query("SELECT COUNT(*)::int AS total FROM profissionais WHERE empresa_id = $1 AND ativo = true", [empresaId]),
    pool.query(
      `SELECT COALESCE(SUM(s.valor), 0)::numeric(10,2) AS previsto
       FROM agendamentos a
       JOIN servicos s ON s.id = a.servico_id
       WHERE a.empresa_id = $1
         AND a.status IN ('AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO')`,
      [empresaId]
    ),
    pool.query(
      `SELECT plano, status, valor_mensal, proxima_cobranca
       FROM assinaturas
       WHERE empresa_id = $1`,
      [empresaId]
    )
  ]);

  res.json({
    hoje: hoje.rows[0],
    semana: semana.rows[0].total,
    clientes: clientes.rows[0].total,
    profissionais: profissionais.rows[0].total,
    faturamento_previsto: faturamento.rows[0].previsto,
    assinatura: assinatura.rows[0] || null
  });
}

module.exports = { resumo };
