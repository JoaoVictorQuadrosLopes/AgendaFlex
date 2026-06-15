import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Settings,
  Scissors,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { canAccess, firstAllowedPath, normalizeRole, roles } from "../config/permissions.js";

const navigation = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/profissionais", label: "Profissionais", icon: BriefcaseBusiness },
  { to: "/app/servicos", label: "Servicos", icon: Scissors },
  { to: "/app/modulos", label: "Modulos", icon: ShieldCheck },
  { to: "/app/relatorios", label: "Relatorios", icon: FileBarChart },
  { to: "/app/assinatura", label: "Assinatura", icon: CreditCard },
  { to: "/app/configuracoes", label: "Configuracoes", icon: Settings }
];

const titles = {
  "/app": "Dashboard",
  "/app/agenda": "Agenda",
  "/app/clientes": "Clientes",
  "/app/profissionais": "Profissionais",
  "/app/servicos": "Servicos",
  "/app/modulos": "Modulos",
  "/app/relatorios": "Relatorios",
  "/app/assinatura": "Assinatura",
  "/app/configuracoes": "Configuracoes"
};

const subtitles = {
  "/app": "Visao geral da operacao, agenda do dia e desempenho da semana.",
  "/app/agenda": "Crie, acompanhe e confirme atendimentos sem conflito de horario.",
  "/app/clientes": "Organize a base de clientes e mantenha os contatos sempre a mao.",
  "/app/profissionais": "Gerencie quem atende, funcoes e dados de contato.",
  "/app/servicos": "Configure servicos, duracoes e valores da agenda.",
  "/app/modulos": "Veja os modulos que podem evoluir a operacao.",
  "/app/relatorios": "Acompanhe leituras importantes sobre movimento e receita.",
  "/app/assinatura": "Controle plano, cobranca e checkout da assinatura.",
  "/app/configuracoes": "Ajuste dados da empresa e a linguagem usada no sistema."
};

function initials(name = "Usuario") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AppLayout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const visibleNavigation = navigation.filter((item) => canAccess(usuario?.tipo, item.to));
  const userRole = normalizeRole(usuario?.tipo);
  const title = titles[location.pathname] || "AgendaFlex";
  const subtitle = subtitles[location.pathname] || "Gestao simples para sua rotina de agendamentos.";
  const homePath = firstAllowedPath(usuario?.tipo);

  return (
    <div className="workspace-shell">
      <div className="workspace-frame">
        <aside className="workspace-sidebar">
          <div className="brand">
            <div className="brand-mark">
              <CalendarDays size={21} />
            </div>
            <div>
              <strong>AgendaFlex</strong>
              <span>Gestao de agendamentos</span>
            </div>
          </div>

          <nav className="workspace-nav" aria-label="Navegacao principal">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === "/app"}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="workspace-avatar">{initials(usuario?.nome)}</div>
            <div>
              <span>{roles[userRole] || usuario?.tipo || "Usuario"}</span>
              <strong>{usuario?.nome || "Usuario"}</strong>
            </div>
            <button className="icon-button" onClick={logout} title="Sair" type="button">
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <div className="workspace-content">
          <header className="workspace-topbar">
            <div>
              <span className="eyebrow">AgendaFlex</span>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            {location.pathname !== homePath && (
              <NavLink className="outline-button topbar-home-link" to={homePath}>
                Minha area
              </NavLink>
            )}
            <button className="icon-button" onClick={logout} title="Sair" type="button">
              <LogOut size={18} />
            </button>
          </header>

          <main className="workspace-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
