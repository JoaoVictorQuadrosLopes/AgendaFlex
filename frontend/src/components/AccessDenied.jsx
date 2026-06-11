import React from "react";
import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { firstAllowedPath, normalizeRole, roles } from "../config/permissions.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function AccessDenied() {
  const { usuario } = useAuth();
  const homePath = firstAllowedPath(usuario?.tipo);
  const userRole = normalizeRole(usuario?.tipo);

  return (
    <section className="panel access-denied">
      <div className="access-denied-icon">
        <LockKeyhole size={24} />
      </div>
      <span className="eyebrow">Acesso restrito</span>
      <h2>Esta area nao esta liberada para {roles[userRole] || "este perfil"}.</h2>
      <p>Entre com um perfil administrador ou volte para a sua area de trabalho.</p>
      <Link className="primary-button" to={homePath}>
        Ir para minha area
      </Link>
    </section>
  );
}
