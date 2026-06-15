const { normalizeRole } = require("../config/roles");

function authorize(...allowedRoles) {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  return function authorizationMiddleware(req, res, next) {
    const role = normalizeRole(req.usuario?.tipo);

    if (!normalizedAllowedRoles.includes(role)) {
      return res.status(403).json({ mensagem: "Perfil sem permissao para acessar este recurso" });
    }

    return next();
  };
}

module.exports = authorize;
