import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  CalendarCheck,
  CheckCircle2,
  CircleMinus,
  ClipboardList,
  ContactRound,
  FileBarChart,
  KeyRound,
  MessageCircle,
  Package,
  Scissors,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users
} from "lucide-react";
import { canAccess, permissionMatrix, roles } from "../config/permissions.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const modulos = [
  {
    title: "Agenda operacional",
    text: "Crie, acompanhe e confirme atendimentos por dia, profissional, origem e status.",
    icon: CalendarCheck,
    status: "Ativo",
    path: "/app/agenda",
    action: "Abrir agenda"
  },
  {
    title: "Clientes",
    text: "Cadastre contatos, documentos e observacoes para acelerar novos agendamentos.",
    icon: ContactRound,
    status: "Ativo",
    path: "/app/clientes",
    action: "Gerenciar clientes"
  },
  {
    title: "Profissionais",
    text: "Defina quem atende e mantenha dados da equipe organizados.",
    icon: Users,
    status: "Ativo",
    path: "/app/profissionais",
    action: "Gerenciar equipe"
  },
  {
    title: "Servicos",
    text: "Configure duracao, valor e descricao dos servicos vendidos na agenda.",
    icon: Scissors,
    status: "Ativo",
    path: "/app/servicos",
    action: "Gerenciar servicos"
  },
  {
    title: "Usuarios e cargos",
    text: "Crie acessos separados para administrador, recepcao e profissional.",
    icon: KeyRound,
    status: "Ativo",
    path: "/app/configuracoes",
    action: "Configurar acessos"
  },
  {
    title: "Permissoes",
    text: "A matriz abaixo controla navegacao e acoes como criar, editar e excluir registros.",
    icon: ShieldCheck,
    status: "Ativo",
    path: "/app/modulos",
    action: "Ver matriz"
  },
  {
    title: "Assinatura",
    text: "Acompanhe plano, limites de uso e preparacao para checkout.",
    icon: BadgeDollarSign,
    status: "Ativo",
    path: "/app/assinatura",
    action: "Ver assinatura"
  },
  {
    title: "Configuracoes da empresa",
    text: "Ajuste segmento, termos usados no sistema, link publico e integracoes.",
    icon: Settings,
    status: "Ativo",
    path: "/app/configuracoes",
    action: "Abrir configuracoes"
  },
  {
    title: "WhatsApp",
    text: "Webhook e envio por WhatsApp Cloud API ja estao preparados para credenciais reais.",
    icon: MessageCircle,
    status: "Configuravel",
    path: "/app/configuracoes",
    action: "Configurar WhatsApp"
  },
  {
    title: "Relatorios",
    text: "Indicadores iniciais existem; a proxima evolucao e trazer filtros reais e exportacao.",
    icon: FileBarChart,
    status: "Em evolucao",
    path: "/app/relatorios",
    action: "Abrir relatorios"
  },
  {
    title: "Financeiro",
    text: "Contas, recibos, cobrancas e faturamento operacional entram depois do checkout.",
    icon: ClipboardList,
    status: "Futuro"
  },
  {
    title: "Estoque",
    text: "Modulo futuro para produtos, pecas e insumos usados em atendimentos.",
    icon: Package,
    status: "Futuro"
  },
  {
    title: "Personalizacao SaaS",
    text: "Base preparada para adaptar nomes, segmentos e regras por empresa.",
    icon: SlidersHorizontal,
    status: "Em evolucao",
    path: "/app/configuracoes",
    action: "Personalizar"
  }
];

export default function Modulos() {
  const { usuario } = useAuth();
  const modulosAtivos = modulos.filter((modulo) => modulo.path && canAccess(usuario?.tipo, modulo.path)).length;

  return (
    <section className="content-stack modules-workspace">
      <section className="modules-command-panel">
        <div>
          <span className="eyebrow">Modulos do sistema</span>
          <h2>Controle o que ja esta funcional e quem pode acessar cada area.</h2>
          <p>
            Esta tela agora funciona como um mapa operacional: os cards abrem modulos reais,
            e a matriz mostra a divisao de cargos usada pela navegacao e pelas acoes do sistema.
          </p>
        </div>
        <div className="module-kpis" aria-label="Resumo de modulos">
          <article>
            <strong>{modulos.filter((modulo) => modulo.status === "Ativo").length}</strong>
            <span>ativos</span>
          </article>
          <article>
            <strong>{modulosAtivos}</strong>
            <span>liberados para voce</span>
          </article>
          <article>
            <strong>{Object.keys(roles).length}</strong>
            <span>cargos</span>
          </article>
        </div>
      </section>

      <section className="module-grid functional-module-grid">
        {modulos.map((modulo) => {
          const Icon = modulo.icon;
          const unlocked = modulo.path ? canAccess(usuario?.tipo, modulo.path) : false;

          return (
            <article className={`module-card module-status-${modulo.status.replace(/\s/g, "-").toLowerCase()}`} key={modulo.title}>
              <div className="module-icon">
                <Icon size={21} />
              </div>
              <div>
                <div className="module-heading">
                  <h3>{modulo.title}</h3>
                  <span>{modulo.status}</span>
                </div>
                <p>{modulo.text}</p>
                {modulo.path && unlocked ? (
                  <Link className="outline-button module-action" to={modulo.path}>
                    {modulo.action}
                  </Link>
                ) : modulo.path ? (
                  <span className="module-locked">Restrito para seu cargo</span>
                ) : (
                  <span className="module-locked">Ainda nao implementado</span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel access-matrix-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Cargos e permissoes</span>
            <h2>Matriz de acesso por area</h2>
          </div>
        </div>

        <div className="access-matrix">
          <div className="access-matrix-head">
            <span>Area</span>
            {Object.entries(roles).map(([role, label]) => (
              <strong key={role}>{label}</strong>
            ))}
          </div>

          {permissionMatrix.map((item) => (
            <div className="access-matrix-row" key={item.path}>
              <strong>{item.label}</strong>
              {Object.keys(roles).map((role) => {
                const allowed = item.roles.includes(role);
                return (
                  <span className={allowed ? "allowed" : "blocked"} key={role}>
                    {allowed ? <CheckCircle2 size={18} /> : <CircleMinus size={18} />}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
