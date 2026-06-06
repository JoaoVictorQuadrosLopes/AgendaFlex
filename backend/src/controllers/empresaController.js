const pool = require("../config/database");

async function obter(req, res) {
  const result = await pool.query(
    `SELECT id, nome, tipo_negocio, documento, telefone, endereco,
            termo_cliente, termo_profissional, termo_servico,
            confirmar_whatsapp, lembrete_email, criado_em
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
    lembrete_email
  } = req.body;

  if (!nome || !tipo_negocio) {
    return res.status(400).json({ mensagem: "Nome e segmento sao obrigatorios" });
  }

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
         lembrete_email = $10
     WHERE id = $11
     RETURNING id, nome, tipo_negocio, documento, telefone, endereco,
               termo_cliente, termo_profissional, termo_servico,
               confirmar_whatsapp, lembrete_email, criado_em`,
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
      req.usuario.empresa_id
    ]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Empresa nao encontrada" });
  }

  res.json(result.rows[0]);
}

module.exports = { obter, atualizar };
