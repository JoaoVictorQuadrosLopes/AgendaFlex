const pool = require("../config/database");

async function listar(req, res) {
  const result = await pool.query(
    "SELECT * FROM clientes WHERE empresa_id = $1 ORDER BY nome",
    [req.usuario.empresa_id]
  );

  res.json(result.rows);
}

async function criar(req, res) {
  const { nome, telefone, email, documento, observacoes } = req.body;

  if (!nome) {
    return res.status(400).json({ mensagem: "Nome e obrigatorio" });
  }

  const result = await pool.query(
    `INSERT INTO clientes (empresa_id, nome, telefone, email, documento, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [req.usuario.empresa_id, nome, telefone || null, email || null, documento || null, observacoes || null]
  );

  res.status(201).json(result.rows[0]);
}

async function atualizar(req, res) {
  const { nome, telefone, email, documento, observacoes } = req.body;
  const result = await pool.query(
    `UPDATE clientes
     SET nome = $1, telefone = $2, email = $3, documento = $4, observacoes = $5
     WHERE id = $6 AND empresa_id = $7
     RETURNING *`,
    [nome, telefone || null, email || null, documento || null, observacoes || null, req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Cliente nao encontrado" });
  }

  res.json(result.rows[0]);
}

async function excluir(req, res) {
  const result = await pool.query(
    "DELETE FROM clientes WHERE id = $1 AND empresa_id = $2 RETURNING id",
    [req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Cliente nao encontrado" });
  }

  res.status(204).send();
}

module.exports = { listar, criar, atualizar, excluir };
