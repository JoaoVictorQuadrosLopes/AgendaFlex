const pool = require("../config/database");
const { enviarMensagemTexto } = require("../services/whatsappService");
const { verificarLimiteDisponivel } = require("../services/planLimitService");

const STATUS_VALIDOS = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO", "NAO_COMPARECEU"];

async function listar(req, res) {
  const { data, status, origem, busca } = req.query;
  const params = [req.usuario.empresa_id];
  const filtros = [];

  if (data) {
    params.push(data);
    filtros.push(`a.data_agendamento = $${params.length}`);
  }

  if (status) {
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ mensagem: "Status invalido" });
    }

    params.push(status);
    filtros.push(`a.status = $${params.length}`);
  }

  if (origem) {
    if (!["MANUAL", "ONLINE", "WHATSAPP"].includes(origem)) {
      return res.status(400).json({ mensagem: "Origem invalida" });
    }

    params.push(origem);
    filtros.push(`a.origem = $${params.length}`);
  }

  if (busca) {
    params.push(`%${String(busca).trim()}%`);
    filtros.push(`(
      c.nome ILIKE $${params.length}
      OR c.telefone ILIKE $${params.length}
      OR p.nome ILIKE $${params.length}
      OR s.nome ILIKE $${params.length}
    )`);
  }

  const result = await pool.query(
    `SELECT a.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
            p.nome AS profissional_nome, s.nome AS servico_nome, s.valor AS servico_valor
     FROM agendamentos a
     LEFT JOIN clientes c ON c.id = a.cliente_id
     LEFT JOIN profissionais p ON p.id = a.profissional_id
     LEFT JOIN servicos s ON s.id = a.servico_id
     WHERE a.empresa_id = $1
       ${filtros.length ? `AND ${filtros.join(" AND ")}` : ""}
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

  await verificarLimiteDisponivel(req.usuario.empresa_id, "agendamentos_mes");

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
       (empresa_id, cliente_id, profissional_id, servico_id, data_agendamento, hora_inicio, hora_fim, origem, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'MANUAL', $8)
     RETURNING *`,
    [req.usuario.empresa_id, cliente_id, profissional_id, servico_id, data_agendamento, hora_inicio, hora_fim, observacoes || null]
  );

  res.status(201).json(result.rows[0]);
}

async function atualizar(req, res) {
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
       AND id <> $2
       AND profissional_id = $3
       AND data_agendamento = $4
       AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')
       AND hora_inicio < $6
       AND hora_fim > $5`,
    [req.usuario.empresa_id, req.params.id, profissional_id, data_agendamento, hora_inicio, hora_fim]
  );

  if (conflito.rows.length > 0) {
    return res.status(409).json({ mensagem: "Profissional ja possui agendamento nesse horario" });
  }

  const result = await pool.query(
    `UPDATE agendamentos
     SET cliente_id = $1,
         profissional_id = $2,
         servico_id = $3,
         data_agendamento = $4,
         hora_inicio = $5,
         hora_fim = $6,
         observacoes = $7
     WHERE id = $8 AND empresa_id = $9
     RETURNING *`,
    [
      cliente_id,
      profissional_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      hora_fim,
      observacoes || null,
      req.params.id,
      req.usuario.empresa_id
    ]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Agendamento nao encontrado" });
  }

  res.json(result.rows[0]);
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

async function excluir(req, res) {
  const result = await pool.query(
    "DELETE FROM agendamentos WHERE id = $1 AND empresa_id = $2 RETURNING id",
    [req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Agendamento nao encontrado" });
  }

  res.status(204).send();
}

async function enviarConfirmacaoWhatsapp(req, res) {
  const result = await pool.query(
    `SELECT a.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
            p.nome AS profissional_nome, s.nome AS servico_nome
     FROM agendamentos a
     LEFT JOIN clientes c ON c.id = a.cliente_id
     LEFT JOIN profissionais p ON p.id = a.profissional_id
     LEFT JOIN servicos s ON s.id = a.servico_id
     WHERE a.id = $1 AND a.empresa_id = $2`,
    [req.params.id, req.usuario.empresa_id]
  );

  const agendamento = result.rows[0];

  if (!agendamento) {
    return res.status(404).json({ mensagem: "Agendamento nao encontrado" });
  }

  const telefone = (agendamento.cliente_telefone || "").replace(/\D/g, "");

  if (!telefone) {
    return res.status(400).json({ mensagem: "Cliente sem telefone cadastrado" });
  }

  const mensagem = [
    `Ola ${agendamento.cliente_nome || "cliente"}.`,
    `Seu atendimento ${agendamento.servico_nome || ""} esta marcado para ${agendamento.data_agendamento} as ${String(agendamento.hora_inicio).slice(0, 5)}.`,
    `Para confirmar, responda: confirmar #${agendamento.id}`
  ].join(" ");

  const envio = await enviarMensagemTexto(telefone, mensagem);

  if (!envio) {
    return res.status(502).json({ mensagem: "Nao foi possivel enviar a mensagem pelo WhatsApp" });
  }

  res.json({ mensagem: "Confirmacao enviada pelo WhatsApp", envio });
}

module.exports = { listar, criar, atualizar, alterarStatus, excluir, enviarConfirmacaoWhatsapp };
