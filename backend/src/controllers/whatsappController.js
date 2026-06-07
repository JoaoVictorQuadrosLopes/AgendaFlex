const crypto = require("crypto");
const pool = require("../config/database");
const { enviarMensagemTexto } = require("../services/whatsappService");
const { interpretarMensagemWhatsApp, limparTelefone, normalizarTexto } = require("../utils/whatsappParser");

function verificarWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

function assinaturaValida(req) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    return true;
  }

  const assinatura = req.headers["x-hub-signature-256"];

  if (!assinatura || !req.rawBody) {
    return false;
  }

  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(req.rawBody).digest("hex")}`;
  const assinaturaBuffer = Buffer.from(assinatura);
  const expectedBuffer = Buffer.from(expected);

  return assinaturaBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(assinaturaBuffer, expectedBuffer);
}

function extrairMensagens(payload) {
  return extrairMensagensMeta(payload);
}

function extrairMensagensMeta(payload) {
  const mensagens = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "messages") continue;

      const value = change.value || {};
      const phoneNumberId = value.metadata?.phone_number_id || null;

      for (const message of value.messages || []) {
        mensagens.push({
          phone_number_id: phoneNumberId,
          message_id: message.id,
          telefone_cliente: message.from,
          nome_cliente: value.contacts?.find((contact) => contact.wa_id === message.from)?.profile?.name || null,
          texto: message.text?.body || "",
          tipo: message.type
        });
      }
    }
  }

  return mensagens;
}

async function buscarEmpresa(phoneNumberId) {
  if (phoneNumberId) {
    const empresaPorNumero = await pool.query(
      "SELECT id FROM empresas WHERE whatsapp_phone_number_id = $1 LIMIT 1",
      [phoneNumberId]
    );

    if (empresaPorNumero.rows[0]) {
      return empresaPorNumero.rows[0].id;
    }
  }

  if (process.env.WHATSAPP_DEFAULT_EMPRESA_ID) {
    return Number(process.env.WHATSAPP_DEFAULT_EMPRESA_ID);
  }

  const unicaEmpresa = await pool.query("SELECT id FROM empresas ORDER BY id LIMIT 1");
  return unicaEmpresa.rows[0]?.id || null;
}

async function registrarMensagem(empresaId, mensagem, acao, status, erro = null) {
  await pool.query(
    `INSERT INTO whatsapp_mensagens
       (empresa_id, whatsapp_message_id, telefone_cliente, nome_cliente, conteudo, acao_detectada, status_processamento, erro)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (whatsapp_message_id) DO NOTHING`,
    [
      empresaId,
      mensagem.message_id,
      mensagem.telefone_cliente,
      mensagem.nome_cliente,
      mensagem.texto,
      acao,
      status,
      erro
    ]
  );
}

async function confirmarAgendamento(empresaId, agendamentoId) {
  const result = await pool.query(
    `UPDATE agendamentos
     SET status = 'CONFIRMADO'
     WHERE id = $1 AND empresa_id = $2
     RETURNING *`,
    [agendamentoId, empresaId]
  );

  return result.rows[0] || null;
}

async function buscarOuCriarCliente(client, empresaId, nome, telefone) {
  const telefoneLimpo = limparTelefone(telefone);
  const existente = await client.query(
    `SELECT * FROM clientes
     WHERE empresa_id = $1 AND regexp_replace(COALESCE(telefone, ''), '\\D', '', 'g') = $2
     LIMIT 1`,
    [empresaId, telefoneLimpo]
  );

  if (existente.rows[0]) {
    return existente.rows[0];
  }

  const criado = await client.query(
    `INSERT INTO clientes (empresa_id, nome, telefone, observacoes)
     VALUES ($1, $2, $3, 'Criado automaticamente via WhatsApp')
     RETURNING *`,
    [empresaId, nome || `Cliente ${telefoneLimpo}`, telefoneLimpo]
  );

  return criado.rows[0];
}

async function buscarPorNome(client, tabela, empresaId, nome) {
  const result = await client.query(
    `SELECT *
     FROM ${tabela}
     WHERE empresa_id = $1 AND ativo IS NOT FALSE
     ORDER BY nome`,
    [empresaId]
  );

  const termo = normalizarTexto(nome);
  return result.rows.find((row) => normalizarTexto(row.nome).includes(termo)) || null;
}

function somarMinutos(hora, minutos) {
  const [hours, mins] = hora.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + Number(minutos), 0, 0);
  return date.toTimeString().slice(0, 5);
}

async function criarAgendamentoConfirmado(empresaId, dados) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cliente = await buscarOuCriarCliente(client, empresaId, dados.cliente_nome, dados.cliente_telefone);
    const servico = await buscarPorNome(client, "servicos", empresaId, dados.servico_nome);
    const profissional = await buscarPorNome(client, "profissionais", empresaId, dados.profissional_nome);

    if (!servico || !profissional) {
      throw new Error("Servico ou profissional nao encontrado");
    }

    const horaFim = somarMinutos(dados.hora_inicio, servico.duracao_minutos || 30);
    const conflito = await client.query(
      `SELECT id FROM agendamentos
       WHERE empresa_id = $1
         AND profissional_id = $2
         AND data_agendamento = $3
         AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')
         AND hora_inicio < $5
         AND hora_fim > $4`,
      [empresaId, profissional.id, dados.data_agendamento, dados.hora_inicio, horaFim]
    );

    if (conflito.rows.length > 0) {
      throw new Error("Profissional ja possui agendamento nesse horario");
    }

    const agendamento = await client.query(
      `INSERT INTO agendamentos
         (empresa_id, cliente_id, profissional_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMADO', $8)
       RETURNING *`,
      [
        empresaId,
        cliente.id,
        profissional.id,
        servico.id,
        dados.data_agendamento,
        dados.hora_inicio,
        horaFim,
        dados.observacoes
      ]
    );

    await client.query("COMMIT");
    return agendamento.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function processarMensagem(mensagem) {
  const empresaId = await buscarEmpresa(mensagem.phone_number_id);

  if (!empresaId) {
    await registrarMensagem(null, mensagem, null, "ERRO", "Empresa nao encontrada para o numero do WhatsApp");
    return;
  }

  const interpretacao = interpretarMensagemWhatsApp(mensagem.texto, mensagem.telefone_cliente);

  if (!interpretacao) {
    await registrarMensagem(empresaId, mensagem, null, "IGNORADO");
    return;
  }

  try {
    if (interpretacao.tipo === "CONFIRMAR_AGENDAMENTO") {
      const agendamento = await confirmarAgendamento(empresaId, interpretacao.agendamento_id);

      if (!agendamento) {
        throw new Error("Agendamento nao encontrado");
      }

      await registrarMensagem(empresaId, mensagem, interpretacao.tipo, "PROCESSADO");
      await enviarMensagemTexto(mensagem.telefone_cliente, `Agendamento #${agendamento.id} confirmado com sucesso.`);
      return;
    }

    const agendamento = await criarAgendamentoConfirmado(empresaId, {
      ...interpretacao,
      cliente_nome: interpretacao.cliente_nome || mensagem.nome_cliente
    });

    await registrarMensagem(empresaId, mensagem, interpretacao.tipo, "PROCESSADO");
    await enviarMensagemTexto(
      mensagem.telefone_cliente,
      `Agendamento confirmado para ${agendamento.data_agendamento} as ${String(agendamento.hora_inicio).slice(0, 5)}.`
    );
  } catch (error) {
    await registrarMensagem(empresaId, mensagem, interpretacao.tipo, "ERRO", error.message);
    await enviarMensagemTexto(mensagem.telefone_cliente, `Nao consegui confirmar automaticamente: ${error.message}.`);
  }
}

async function receberWebhook(req, res) {
  if (!assinaturaValida(req)) {
    return res.sendStatus(401);
  }

  const mensagens = extrairMensagens(req.body).filter((mensagem) => mensagem.tipo === "text" && mensagem.texto);

  res.sendStatus(200);

  for (const mensagem of mensagens) {
    processarMensagem(mensagem).catch((error) => {
      console.error("Erro ao processar mensagem WhatsApp", error);
    });
  }
}

module.exports = { verificarWebhook, receberWebhook };
