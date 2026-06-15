const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { ROLES, isValidRole, normalizeRole } = require("../config/roles");
const { verificarLimiteDisponivel } = require("../services/planLimitService");

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validarTipo(tipo) {
  const role = normalizeRole(tipo || "PROFISSIONAL");
  return isValidRole(role) ? role : null;
}

async function contarAdmins(empresaId, ignoreUserId) {
  const params = [empresaId];
  let ignoreSql = "";

  if (ignoreUserId) {
    params.push(ignoreUserId);
    ignoreSql = `AND id <> $${params.length}`;
  }

  const result = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM usuarios
     WHERE empresa_id = $1 AND tipo = 'ADMIN' ${ignoreSql}`,
    params
  );

  return result.rows[0]?.total || 0;
}

function validarPayload({ nome, email, tipo }, exigirSenha, senha) {
  const nomeTratado = String(nome || "").trim();
  const emailTratado = normalizarEmail(email);
  const tipoTratado = validarTipo(tipo);

  if (!nomeTratado || !emailTratado || (exigirSenha && !senha)) {
    return { erro: "Nome, e-mail e senha sao obrigatorios" };
  }

  if (!emailTratado.includes("@")) {
    return { erro: "Informe um e-mail valido" };
  }

  if (!tipoTratado) {
    return { erro: `Perfil invalido. Use: ${ROLES.join(", ")}` };
  }

  return { nomeTratado, emailTratado, tipoTratado };
}

async function listar(req, res) {
  const result = await pool.query(
    `SELECT id, empresa_id, nome, email, tipo, criado_em
     FROM usuarios
     WHERE empresa_id = $1
     ORDER BY criado_em ASC`,
    [req.usuario.empresa_id]
  );

  return res.json(result.rows);
}

async function criar(req, res) {
  const { nome, email, senha, tipo } = req.body;
  const validacao = validarPayload({ nome, email, tipo }, true, senha);

  if (validacao.erro) {
    return res.status(400).json({ mensagem: validacao.erro });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  try {
    await verificarLimiteDisponivel(req.usuario.empresa_id, "usuarios");

    const result = await pool.query(
      `INSERT INTO usuarios (empresa_id, nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, empresa_id, nome, email, tipo, criado_em`,
      [req.usuario.empresa_id, validacao.nomeTratado, validacao.emailTratado, senhaHash, validacao.tipoTratado]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ mensagem: "E-mail ja cadastrado" });
    }

    throw error;
  }
}

async function atualizar(req, res) {
  const { nome, email, tipo, senha } = req.body;
  const validacao = validarPayload({ nome, email, tipo }, false, senha);

  if (validacao.erro) {
    return res.status(400).json({ mensagem: validacao.erro });
  }

  const usuarioAtualResult = await pool.query(
    "SELECT id, tipo FROM usuarios WHERE id = $1 AND empresa_id = $2",
    [req.params.id, req.usuario.empresa_id]
  );

  if (usuarioAtualResult.rowCount === 0) {
    return res.status(404).json({ mensagem: "Usuario nao encontrado" });
  }

  const usuarioAtual = usuarioAtualResult.rows[0];

  if (usuarioAtual.tipo === "ADMIN" && validacao.tipoTratado !== "ADMIN") {
    const adminsRestantes = await contarAdmins(req.usuario.empresa_id, req.params.id);

    if (adminsRestantes === 0) {
      return res.status(400).json({ mensagem: "A empresa precisa manter pelo menos um administrador" });
    }
  }

  const params = [
    validacao.nomeTratado,
    validacao.emailTratado,
    validacao.tipoTratado,
    req.params.id,
    req.usuario.empresa_id
  ];
  let senhaSql = "";

  if (senha) {
    params.push(await bcrypt.hash(senha, 10));
    senhaSql = `, senha = $${params.length}`;
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET nome = $1, email = $2, tipo = $3 ${senhaSql}
       WHERE id = $4 AND empresa_id = $5
       RETURNING id, empresa_id, nome, email, tipo, criado_em`,
      params
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ mensagem: "E-mail ja cadastrado" });
    }

    throw error;
  }
}

async function excluir(req, res) {
  if (String(req.params.id) === String(req.usuario.id)) {
    return res.status(400).json({ mensagem: "Voce nao pode excluir seu proprio acesso" });
  }

  const usuarioResult = await pool.query("SELECT tipo FROM usuarios WHERE id = $1 AND empresa_id = $2", [
    req.params.id,
    req.usuario.empresa_id
  ]);

  if (usuarioResult.rowCount === 0) {
    return res.status(404).json({ mensagem: "Usuario nao encontrado" });
  }

  if (usuarioResult.rows[0].tipo === "ADMIN") {
    const adminsRestantes = await contarAdmins(req.usuario.empresa_id, req.params.id);

    if (adminsRestantes === 0) {
      return res.status(400).json({ mensagem: "A empresa precisa manter pelo menos um administrador" });
    }
  }

  await pool.query("DELETE FROM usuarios WHERE id = $1 AND empresa_id = $2", [req.params.id, req.usuario.empresa_id]);

  return res.status(204).send();
}

module.exports = { listar, criar, atualizar, excluir };
