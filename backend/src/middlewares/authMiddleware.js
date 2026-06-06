const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token nao informado" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ mensagem: "Token invalido" });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token invalido ou expirado" });
  }
}

module.exports = authMiddleware;
