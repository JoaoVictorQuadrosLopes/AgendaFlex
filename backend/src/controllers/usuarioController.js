const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const rolesPermitidos = ["ADMIN", "RECEPCAO", "PROFISSIONAL"];

function normalizarTipo(tipo) {
  const role = String(tipo || "PROFISSIONAL").toUpperCase();
  return rolesPermitidos.includes(role) ? role : "PROFISSIONAL";
}

async function listar(req, res) {
  const result = await pool.query(
    `SELECT id, nome, email, tipo, criado_em
     FROM usuarios
     WHERE empresa_id = $1
     ORDER BY criado_em ASC`,
    [req.usuario.empresa_id]
  );

  return res.json(result.rows);
}

async function criar(req, res) {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: "Nome, e-mail e senha sao obrigatorios" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const result = await pool.query(
    `INSERT INTO usuarios (empresa_id, nome, email, senha, tipo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nome, email, tipo, criado_em`,
    [req.usuario.empresa_id, nome, email, senhaHash, normalizarTipo(tipo)]
  );

  return res.status(201).json(result.rows[0]);
}

async function atualizar(req, res) {
  const { nome, email, tipo, senha } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ mensagem: "Nome e e-mail sao obrigatorios" });
  }

  const params = [nome, email, normalizarTipo(tipo), req.params.id, req.usuario.empresa_id];
  let senhaSql = "";

  if (senha) {
    params.push(await bcrypt.hash(senha, 10));
    senhaSql = `, senha = $${params.length}`;
  }

  const result = await pool.query(
    `UPDATE usuarios
     SET nome = $1, email = $2, tipo = $3 ${senhaSql}
     WHERE id = $4 AND empresa_id = $5
     RETURNING id, nome, email, tipo, criado_em`,
    params
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ mensagem: "Usuario nao encontrado" });
  }

  return res.json(result.rows[0]);
}

async function excluir(req, res) {
  if (String(req.params.id) === String(req.usuario.id)) {
    return res.status(400).json({ mensagem: "Voce nao pode excluir seu proprio acesso" });
  }

  const result = await pool.query("DELETE FROM usuarios WHERE id = $1 AND empresa_id = $2", [
    req.params.id,
    req.usuario.empresa_id
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({ mensagem: "Usuario nao encontrado" });
  }

  return res.status(204).send();
}

module.exports = { listar, criar, atualizar, excluir };
