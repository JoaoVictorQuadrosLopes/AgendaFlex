const pool = require("../config/database");

async function resumo(req, res) {
  const empresaId = req.usuario.empresa_id;

  const [
    hoje,
    semana,
    clientes,
    profissionais,
    servicos,
    faturamento,
    assinatura,
    graficoSemana,
    onlineSemana,
    proximosOnline,
    empresa
  ] = await Promise.all([
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
    pool.query("SELECT COUNT(*)::int AS total FROM servicos WHERE empresa_id = $1 AND ativo IS NOT FALSE", [empresaId]),
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
    ),
    pool.query(
      `SELECT id, nome, telefone, agendamento_slug, termo_cliente, termo_profissional, termo_servico
       FROM empresas
       WHERE id = $1`,
      [empresaId]
    )
  ]);

  const empresaAtual = empresa.rows[0] || {};
  const onboardingSteps = [
    {
      id: "empresa",
      label: "Completar dados da empresa",
      description: "Nome, telefone, termos usados na agenda e identidade basica.",
      path: "/app/configuracoes",
      done: Boolean(empresaAtual.nome && empresaAtual.telefone)
    },
    {
      id: "servicos",
      label: "Cadastrar servicos",
      description: "Defina duracao, valor e o que pode ser agendado.",
      path: "/app/servicos",
      done: servicos.rows[0].total > 0
    },
    {
      id: "profissionais",
      label: "Cadastrar profissionais",
      description: "Inclua quem atende para liberar horarios na agenda.",
      path: "/app/profissionais",
      done: profissionais.rows[0].total > 0
    },
    {
      id: "link-publico",
      label: "Configurar link publico",
      description: "Crie um slug simples para seus clientes agendarem online.",
      path: "/app/configuracoes",
      done: Boolean(empresaAtual.agendamento_slug)
    },
    {
      id: "primeiro-agendamento",
      label: "Criar primeiro agendamento",
      description: "Valide a rotina criando ou recebendo o primeiro horario.",
      path: "/app/agenda",
      done: semana.rows[0].total > 0
    }
  ];

  res.json({
    hoje: hoje.rows[0],
    semana: semana.rows[0].total,
    clientes: clientes.rows[0].total,
    profissionais: profissionais.rows[0].total,
    servicos: servicos.rows[0].total,
    faturamento_previsto: faturamento.rows[0].previsto,
    assinatura: assinatura.rows[0] || null,
    grafico_semana: graficoSemana.rows,
    online_semana: onlineSemana.rows[0].total,
    proximos_online: proximosOnline.rows,
    link_publico_ref: empresaAtual.agendamento_slug || String(empresaAtual.id || empresaId),
    onboarding: {
      completo: onboardingSteps.every((step) => step.done),
      total: onboardingSteps.length,
      concluidos: onboardingSteps.filter((step) => step.done).length,
      steps: onboardingSteps
    }
  });
}

module.exports = { resumo };
