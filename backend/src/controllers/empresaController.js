const pool = require("../config/database");

function normalizarSlug(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function obter(req, res) {
  const result = await pool.query(
    `SELECT id, nome, tipo_negocio, documento, telefone, endereco,
            termo_cliente, termo_profissional, termo_servico,
            confirmar_whatsapp, lembrete_email, whatsapp_phone_number_id,
            agendamento_slug, criado_em
     FROM empresas
     WHERE id = $1`,
    [req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Empresa nao encontrada" });
  }

  res.json(result.rows[0]);
}

async function atualizar(req, res) {
  const {
    nome,
    tipo_negocio,
    documento,
    telefone,
    endereco,
    termo_cliente,
    termo_profissional,
    termo_servico,
    confirmar_whatsapp,
    lembrete_email,
    whatsapp_phone_number_id,
    agendamento_slug
  } = req.body;

  if (!nome || !tipo_negocio) {
    return res.status(400).json({ mensagem: "Nome e segmento sao obrigatorios" });
  }

  const slugNormalizado = normalizarSlug(agendamento_slug || nome);

  try {
    const result = await pool.query(
      `UPDATE empresas
       SET nome = $1,
           tipo_negocio = $2,
           documento = $3,
           telefone = $4,
           endereco = $5,
           termo_cliente = $6,
           termo_profissional = $7,
           termo_servico = $8,
           confirmar_whatsapp = $9,
           lembrete_email = $10,
           whatsapp_phone_number_id = $11,
           agendamento_slug = $12
       WHERE id = $13
       RETURNING id, nome, tipo_negocio, documento, telefone, endereco,
                 termo_cliente, termo_profissional, termo_servico,
                 confirmar_whatsapp, lembrete_email, whatsapp_phone_number_id,
                 agendamento_slug, criado_em`,
      [
        nome,
        tipo_negocio,
        documento || null,
        telefone || null,
        endereco || null,
        termo_cliente || "Cliente",
        termo_profissional || "Profissional",
        termo_servico || "Servico",
        Boolean(confirmar_whatsapp),
        Boolean(lembrete_email),
        whatsapp_phone_number_id || null,
        slugNormalizado || null,
        req.usuario.empresa_id
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ mensagem: "Empresa nao encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ mensagem: "Este link publico ja esta em uso" });
    }

    throw error;
  }
}

module.exports = { obter, atualizar };
