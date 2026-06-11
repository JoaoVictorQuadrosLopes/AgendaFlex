import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Users
} from "lucide-react";
import api from "../services/api";
import OriginBadge from "../components/OriginBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const emptyWeekData = [
  { name: "Seg", agendamentos: 4 },
  { name: "Ter", agendamentos: 7 },
  { name: "Qua", agendamentos: 5 },
  { name: "Qui", agendamentos: 9 },
  { name: "Sex", agendamentos: 6 }
];

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/resumo")
      .then(({ data }) => setResumo(data))
      .catch(() => setErro("Conecte o banco para carregar dados reais do dashboard."));
  }, []);

  const cards = [
    { label: "Hoje", value: resumo?.hoje?.total ?? 0, icon: CalendarDays },
    { label: "Confirmados", value: resumo?.hoje?.confirmados ?? 0, icon: CheckCircle2 },
    { label: "Clientes", value: resumo?.clientes ?? 0, icon: Users },
    { label: "Online", value: resumo?.hoje?.online ?? 0, icon: MessageCircle },
    { label: "Previsto", value: `R$ ${resumo?.faturamento_previsto ?? "0.00"}`, icon: CircleDollarSign },
    { label: "Plano", value: resumo?.assinatura?.plano ?? "starter", icon: CreditCard }
  ];
  const chartData = resumo?.grafico_semana?.length ? resumo.grafico_semana : emptyWeekData;
  const proximosOnline = resumo?.proximos_online || [];

  return (
    <section className="content-stack">
      {erro && <div className="soft-alert">{erro}</div>}

      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Resumo do dia</span>
          <h2>{resumo?.hoje?.total ?? 0} atendimentos na agenda</h2>
          <p>
            {resumo?.hoje?.confirmados ?? 0} confirmados hoje. O restante da operacao aparece abaixo com clientes,
            previsao de faturamento e pedidos recebidos pelo agendamento online.
          </p>
        </div>
        <div className="dashboard-hero-action">
          <ArrowUpRight size={20} />
          <span>{resumo?.online_semana ?? 0} online nos proximos 7 dias</span>
        </div>
      </section>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="stat-card" key={card.label}>
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          );
        })}
      </div>

      <section className="operation-strip">
        <article>
          <MessageCircle size={20} />
          <div>
            <strong>Confirmacao por WhatsApp</strong>
            <span>Envie mensagens de confirmacao direto pela agenda do dia.</span>
          </div>
        </article>
        <article>
          <ShieldCheck size={20} />
          <div>
            <strong>Gestao por segmento</strong>
            <span>Organize clientes, servicos e responsaveis conforme a rotina do negocio.</span>
          </div>
        </article>
        <article>
          <CalendarDays size={20} />
          <div>
            <strong>Agenda sem conflito</strong>
            <span>O backend impede dois atendimentos no mesmo horario para o mesmo profissional.</span>
          </div>
        </article>
      </section>

      <section className="panel online-queue-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Link publico</span>
            <h2>Agendamentos recebidos online</h2>
          </div>
          <Link className="outline-button" to="/agendar/agendaflex" target="_blank">
            Abrir link
          </Link>
        </div>

        {proximosOnline.length === 0 ? (
          <div className="empty-state compact">
            <strong>Nenhum pedido online futuro</strong>
            <span>Quando alguem agendar pelo site, o horario aparece aqui automaticamente.</span>
          </div>
        ) : (
          <div className="online-queue-list">
            {proximosOnline.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.cliente_nome || "Cliente"}</strong>
                  <span>
                    {item.servico_nome || "Servico"} com {item.profissional_nome || "profissional"}
                  </span>
                </div>
                <div className="online-queue-meta">
                  <span>{String(item.data_agendamento).slice(0, 10)} as {String(item.hora_inicio).slice(0, 5)}</span>
                  <OriginBadge origem={item.origem} />
                  <StatusBadge status={item.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Movimento</span>
            <h2>Agendamentos da semana</h2>
          </div>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="agendamentos" fill="#0f8f9c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
}
