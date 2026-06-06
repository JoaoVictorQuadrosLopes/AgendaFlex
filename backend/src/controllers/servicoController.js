const pool = require("../config/database");

async function listar(req, res) {
  const result = await pool.query(
    "SELECT * FROM servicos WHERE empresa_id = $1 ORDER BY nome",
    [req.usuario.empresa_id]
  );

  res.json(result.rows);
}

async function criar(req, res) {
  const { nome, descricao, duracao_minutos, valor } = req.body;

  if (!nome || !duracao_minutos) {
    return res.status(400).json({ mensagem: "Nome e duracao sao obrigatorios" });
  }

  const result = await pool.query(
    `INSERT INTO servicos (empresa_id, nome, descricao, duracao_minutos, valor)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.usuario.empresa_id, nome, descricao || null, duracao_minutos, valor || 0]
  );

  res.status(201).json(result.rows[0]);
}

async function atualizar(req, res) {
  const { nome, descricao, duracao_minutos, valor, ativo = true } = req.body;
  const result = await pool.query(
    `UPDATE servicos
     SET nome = $1, descricao = $2, duracao_minutos = $3, valor = $4, ativo = $5
     WHERE id = $6 AND empresa_id = $7
     RETURNING *`,
    [nome, descricao || null, duracao_minutos, valor || 0, ativo, req.params.id, req.usuario.empresa_id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ mensagem: "Servico nao encontrado" });
  }

  res.json(result.rows[0]);
}

module.exports = { listar, criar, atualizar };
