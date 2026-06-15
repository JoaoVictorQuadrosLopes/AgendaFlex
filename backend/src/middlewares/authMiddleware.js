const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const env = require("../config/env");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token nao informado" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ mensagem: "Token invalido" });
  }

  let payload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ mensagem: "Token invalido ou expirado" });
  }

  const result = await pool.query(
    `SELECT id, empresa_id, nome, email, tipo
     FROM usuarios
     WHERE id = $1 AND empresa_id = $2`,
    [payload.id, payload.empresa_id]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ mensagem: "Sessao invalida. Entre novamente." });
  }

  req.usuario = result.rows[0];
  return next();
}

module.exports = authMiddleware;
