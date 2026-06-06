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
  Wrench
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

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

export default function AppLayout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div className="workspace-inner">
          <div className="brand">
            <div className="brand-mark">
              <Wrench size={21} />
            </div>
            <div>
              <strong>AgendaFlex</strong>
              <span>Gestao de agendamentos</span>
            </div>
          </div>

          <nav className="workspace-nav" aria-label="Navegacao principal">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === "/app"}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="workspace-user">
            <div>
              <span>{usuario?.tipo || "ADMIN"}</span>
              <strong>{usuario?.nome || "Usuario"}</strong>
            </div>
            <button className="icon-button" onClick={logout} title="Sair" type="button">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="workspace-main">
        <section className="workspace-title">
          <div>
            <span className="eyebrow">AgendaFlex</span>
            <h1>{titles[location.pathname] || "AgendaFlex"}</h1>
          </div>
          <div className="business-pill">Operacao online</div>
        </section>

        <Outlet />
      </main>
    </div>
  );
}
