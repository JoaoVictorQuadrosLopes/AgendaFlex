import React from "react";
import {
  BadgeDollarSign,
  CalendarCheck,
  ClipboardList,
  ContactRound,
  FileCheck2,
  KeyRound,
  MessageCircle,
  Package,
  CheckCircle2,
  CircleMinus,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import { permissionMatrix, roles } from "../config/permissions.js";

const modulos = [
  {
    title: "Usuários e cargos",
    text: "Controle quem acessa o sistema e prepare permissões por função, como administrador, recepção e profissional.",
    icon: KeyRound,
    status: "Planejado"
  },
  {
    title: "Habilitações",
    text: "Separe visualização, cadastro e edição por módulo para manter a operação segura conforme cada cargo.",
    icon: ShieldCheck,
    status: "Planejado"
  },
  {
    title: "Clientes e fornecedores",
    text: "Centralize dados de contato, documentos, observações e histórico de relacionamento.",
    icon: ContactRound,
    status: "MVP"
  },
  {
    title: "Serviços e procedimentos",
    text: "Cadastre duração, valor e descrição. A próxima evolução pode incluir combos, comissões e vigência.",
    icon: ClipboardList,
    status: "MVP"
  },
  {
    title: "Agenda operacional",
    text: "Crie compromissos com cliente, profissional, serviço, horário de início, fim e status de atendimento.",
    icon: CalendarCheck,
    status: "MVP"
  },
  {
    title: "Confirmação automática",
    text: "Começa com link de WhatsApp e pode evoluir para envio automático por WhatsApp, e-mail ou SMS.",
    icon: MessageCircle,
    status: "MVP"
  },
  {
    title: "Financeiro",
    text: "Prepare contas, recibos, cobranças e faturamento previsto para acompanhar o resultado da empresa.",
    icon: BadgeDollarSign,
    status: "Futuro"
  },
  {
    title: "Estoque",
    text: "Útil para salões, clínicas, oficinas e pet shops que usam produtos, peças ou insumos nos atendimentos.",
    icon: Package,
    status: "Futuro"
  },
  {
    title: "Relatórios personalizados",
    text: "Analise agendamentos, cancelamentos, faltas, faturamento e produtividade por profissional.",
    icon: FileCheck2,
    status: "Planejado"
  },
  {
    title: "Personalização SaaS",
    text: "Adapte nomes, segmentos, módulos e regras para cada tipo de negócio sem mudar o sistema inteiro.",
    icon: SlidersHorizontal,
    status: "Planejado"
  }
];

export default function Modulos() {
  return (
    <section className="content-stack">
      <section className="panel intro-panel">
        <div>
          <span className="eyebrow">Organização do produto</span>
          <h2>Um sistema modular para negócios que trabalham com horários</h2>
          <p>
            O AgendaFlex pode crescer como uma plataforma SaaS: começa com agenda,
            clientes e serviços, depois recebe permissões, financeiro, relatórios,
            estoque e automações conforme o segmento atendido.
          </p>
        </div>
      </section>

      <section className="panel access-matrix-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Hierarquia</span>
            <h2>Quem acessa cada parte do sistema</h2>
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

      <section className="module-grid">
        {modulos.map((modulo) => {
          const Icon = modulo.icon;
          return (
            <article className="module-card" key={modulo.title}>
              <div className="module-icon">
                <Icon size={21} />
              </div>
              <div>
                <div className="module-heading">
                  <h3>{modulo.title}</h3>
                  <span>{modulo.status}</span>
                </div>
                <p>{modulo.text}</p>
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}
