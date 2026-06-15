const ROLES = ["ADMIN", "RECEPCAO", "PROFISSIONAL"];

function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

function isValidRole(role) {
  return ROLES.includes(normalizeRole(role));
}

module.exports = { ROLES, normalizeRole, isValidRole };
