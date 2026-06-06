import React from "react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, CheckCircle2, CircleDollarSign, CreditCard, MessageCircle, ShieldCheck, Users } from "lucide-react";
import api from "../services/api";

const fallbackData = [
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
    { label: "Previsto", value: `R$ ${resumo?.faturamento_previsto ?? "0.00"}`, icon: CircleDollarSign },
    { label: "Plano", value: resumo?.assinatura?.plano ?? "starter", icon: CreditCard }
  ];

  return (
    <section className="content-stack">
      {erro && <div className="soft-alert">{erro}</div>}

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
            <strong>Confirmação por WhatsApp</strong>
            <span>Envie mensagens de confirmação direto pela agenda do dia.</span>
          </div>
        </article>
        <article>
          <ShieldCheck size={20} />
          <div>
            <strong>Gestão por segmento</strong>
            <span>Organize clientes, serviços e responsáveis conforme a rotina do negócio.</span>
          </div>
        </article>
        <article>
          <CalendarDays size={20} />
          <div>
            <strong>Agenda sem conflito</strong>
            <span>O backend impede dois atendimentos no mesmo horário para o mesmo profissional.</span>
          </div>
        </article>
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
            <BarChart data={fallbackData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="agendamentos" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
}
