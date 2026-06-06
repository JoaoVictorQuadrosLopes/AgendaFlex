const pool = require("../config/database");

async function listar(req, res) {
  const result = await pool.query(
    "SELECT * FROM profissionais WHERE empresa_id = $1 ORDER BY nome",
    [req.usuario.empresa_id]
  );

  res.json(result.rows);
}

async function criar(req, res) {
  const { nome, telefone, email, funcao } = req.body;

  if (!nome) {
    return res.status(400).json({ mensagem: "Nome e obrigatorio" });
  }

  const result = await pool.query(
    `INSERT INTO profissionais (empresa_id, nome, telefone, email, funcao)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.usuario.empresa_id, nome, telefone || null, email || null, funcao || null]
  );

  res.status(201).json(result.rows[0]);
}

async function atualizar(req, res) {
  const { nome, telefone, email, funcao, ativo = true } = req.body;
  const result = await pool.query(
    `UPDATE profissionais
     SET nome = $1, telefone = $2, email = $3, funcao = $4, ativo = $5
     WHERE id = $6 AND empresa_id = $7
     RETURNING *`,
    [nome, telefone || null, email || null, funcao || null, ativo, req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Profissional nao encontrado" });
  }

  res.json(result.rows[0]);
}

async function excluir(req, res) {
  const result = await pool.query(
    "DELETE FROM profissionais WHERE id = $1 AND empresa_id = $2 RETURNING id",
    [req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Profissional nao encontrado" });
  }

  res.status(204).send();
}

module.exports = { listar, criar, atualizar, excluir };
