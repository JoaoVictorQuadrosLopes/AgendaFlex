const pool = require("../config/database");

async function resumo(req, res) {
  const empresaId = req.usuario.empresa_id;

  const [hoje, semana, clientes, profissionais, faturamento, assinatura, graficoSemana, onlineSemana, proximosOnline] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'CONFIRMADO')::int AS confirmados,
         COUNT(*) FILTER (WHERE status = 'CANCELADO')::int AS cancelados,
         COUNT(*) FILTER (WHERE origem = 'ONLINE')::int AS online
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
    ),
    pool.query(
      `SELECT
         TO_CHAR(dia::date, 'DD/MM') AS name,
         COALESCE(COUNT(a.id), 0)::int AS agendamentos
       FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '6 days', INTERVAL '1 day') AS dia
       LEFT JOIN agendamentos a
         ON a.empresa_id = $1
        AND a.data_agendamento = dia::date
       GROUP BY dia
       ORDER BY dia`,
      [empresaId]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM agendamentos
       WHERE empresa_id = $1
         AND origem = 'ONLINE'
         AND data_agendamento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`,
      [empresaId]
    ),
    pool.query(
      `SELECT a.id, a.data_agendamento, a.hora_inicio, a.status, a.origem,
              c.nome AS cliente_nome, p.nome AS profissional_nome, s.nome AS servico_nome
       FROM agendamentos a
       LEFT JOIN clientes c ON c.id = a.cliente_id
       LEFT JOIN profissionais p ON p.id = a.profissional_id
       LEFT JOIN servicos s ON s.id = a.servico_id
       WHERE a.empresa_id = $1
         AND a.origem = 'ONLINE'
         AND a.data_agendamento >= CURRENT_DATE
       ORDER BY a.data_agendamento, a.hora_inicio
       LIMIT 5`,
      [empresaId]
    )
  ]);

  res.json({
    hoje: hoje.rows[0],
    semana: semana.rows[0].total,
    clientes: clientes.rows[0].total,
    profissionais: profissionais.rows[0].total,
    faturamento_previsto: faturamento.rows[0].previsto,
    assinatura: assinatura.rows[0] || null,
    grafico_semana: graficoSemana.rows,
    online_semana: onlineSemana.rows[0].total,
    proximos_online: proximosOnline.rows
  });
}

module.exports = { resumo };
