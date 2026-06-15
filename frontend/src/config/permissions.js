export const roles = {
  ADMIN: "Administrador",
  RECEPCAO: "Recepcao",
  PROFISSIONAL: "Profissional"
};

export const roleDescriptions = {
  ADMIN: "Acesso total ao sistema, assinatura, configuracoes e cadastros.",
  RECEPCAO: "Opera agenda, clientes, profissionais e servicos do dia a dia.",
  PROFISSIONAL: "Acompanha agenda e consulta clientes para atendimento."
};

export const pagePermissions = {
  "/app": ["ADMIN", "RECEPCAO"],
  "/app/agenda": ["ADMIN", "RECEPCAO", "PROFISSIONAL"],
  "/app/clientes": ["ADMIN", "RECEPCAO", "PROFISSIONAL"],
  "/app/profissionais": ["ADMIN", "RECEPCAO"],
  "/app/servicos": ["ADMIN", "RECEPCAO"],
  "/app/modulos": ["ADMIN"],
  "/app/relatorios": ["ADMIN"],
  "/app/assinatura": ["ADMIN"],
  "/app/configuracoes": ["ADMIN"]
};

export const actionPermissions = {
  "agendamentos:create": ["ADMIN", "RECEPCAO"],
  "agendamentos:update": ["ADMIN", "RECEPCAO"],
  "agendamentos:updateStatus": ["ADMIN", "RECEPCAO", "PROFISSIONAL"],
  "agendamentos:sendWhatsapp": ["ADMIN", "RECEPCAO"],
  "agendamentos:delete": ["ADMIN"],
  "clientes:create": ["ADMIN", "RECEPCAO"],
  "clientes:update": ["ADMIN", "RECEPCAO"],
  "clientes:delete": ["ADMIN"],
  "profissionais:create": ["ADMIN"],
  "profissionais:update": ["ADMIN"],
  "profissionais:delete": ["ADMIN"],
  "servicos:create": ["ADMIN", "RECEPCAO"],
  "servicos:update": ["ADMIN", "RECEPCAO"],
  "servicos:delete": ["ADMIN"],
  "usuarios:manage": ["ADMIN"],
  "empresa:update": ["ADMIN"],
  "assinatura:manage": ["ADMIN"]
};

export const permissionMatrix = [
  { label: "Dashboard", path: "/app", roles: pagePermissions["/app"] },
  { label: "Agenda", path: "/app/agenda", roles: pagePermissions["/app/agenda"] },
  { label: "Clientes", path: "/app/clientes", roles: pagePermissions["/app/clientes"] },
  { label: "Profissionais", path: "/app/profissionais", roles: pagePermissions["/app/profissionais"] },
  { label: "Servicos", path: "/app/servicos", roles: pagePermissions["/app/servicos"] },
  { label: "Modulos", path: "/app/modulos", roles: pagePermissions["/app/modulos"] },
  { label: "Relatorios", path: "/app/relatorios", roles: pagePermissions["/app/relatorios"] },
  { label: "Assinatura", path: "/app/assinatura", roles: pagePermissions["/app/assinatura"] },
  { label: "Configuracoes", path: "/app/configuracoes", roles: pagePermissions["/app/configuracoes"] }
];

export function normalizeRole(role) {
  return String(role || "PROFISSIONAL").toUpperCase();
}

export function canAccess(role, path) {
  const allowedRoles = pagePermissions[path] || [];
  return allowedRoles.includes(normalizeRole(role));
}

export function canPerform(role, action) {
  const allowedRoles = actionPermissions[action] || [];
  return allowedRoles.includes(normalizeRole(role));
}

export function firstAllowedPath(role) {
  const currentRole = normalizeRole(role);
  return permissionMatrix.find((item) => item.roles.includes(currentRole))?.path || "/app/agenda";
}
