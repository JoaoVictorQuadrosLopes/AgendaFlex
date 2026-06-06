const pool = require("../config/database");

const STATUS_VALIDOS = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO", "NAO_COMPARECEU"];

async function listar(req, res) {
  const { data } = req.query;
  const params = [req.usuario.empresa_id];
  let filtroData = "";

  if (data) {
    params.push(data);
    filtroData = "AND a.data_agendamento = $2";
  }

  const result = await pool.query(
    `SELECT a.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
            p.nome AS profissional_nome, s.nome AS servico_nome, s.valor AS servico_valor
     FROM agendamentos a
     LEFT JOIN clientes c ON c.id = a.cliente_id
     LEFT JOIN profissionais p ON p.id = a.profissional_id
     LEFT JOIN servicos s ON s.id = a.servico_id
     WHERE a.empresa_id = $1 ${filtroData}
     ORDER BY a.data_agendamento, a.hora_inicio`,
    params
  );

  res.json(result.rows);
}

async function criar(req, res) {
  const {
    cliente_id,
    profissional_id,
    servico_id,
    data_agendamento,
    hora_inicio,
    hora_fim,
    observacoes
  } = req.body;

  if (!cliente_id || !profissional_id || !servico_id || !data_agendamento || !hora_inicio || !hora_fim) {
    return res.status(400).json({ mensagem: "Dados obrigatorios nao informados" });
  }

  const conflito = await pool.query(
    `SELECT id FROM agendamentos
     WHERE empresa_id = $1
       AND profissional_id = $2
       AND data_agendamento = $3
       AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')
       AND hora_inicio < $5
       AND hora_fim > $4`,
    [req.usuario.empresa_id, profissional_id, data_agendamento, hora_inicio, hora_fim]
  );

  if (conflito.rows.length > 0) {
    return res.status(409).json({ mensagem: "Profissional ja possui agendamento nesse horario" });
  }

  const result = await pool.query(
    `INSERT INTO agendamentos
       (empresa_id, cliente_id, profissional_id, servico_id, data_agendamento, hora_inicio, hora_fim, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [req.usuario.empresa_id, cliente_id, profissional_id, servico_id, data_agendamento, hora_inicio, hora_fim, observacoes || null]
  );

  res.status(201).json(result.rows[0]);
}

async function alterarStatus(req, res) {
  const { status } = req.body;

  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ mensagem: "Status invalido" });
  }

  const result = await pool.query(
    `UPDATE agendamentos
     SET status = $1
     WHERE id = $2 AND empresa_id = $3
     RETURNING *`,
    [status, req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Agendamento nao encontrado" });
  }

  res.json(result.rows[0]);
}

module.exports = { listar, criar, alterarStatus };
