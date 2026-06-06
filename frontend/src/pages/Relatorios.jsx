import React from "react";
import { BarChart3, CalendarX2, Clock3, DollarSign, UserRoundCheck } from "lucide-react";

const reports = [
  {
    title: "Agendamentos por período",
    text: "Acompanhe volume diário, semanal e mensal para entender horários de maior movimento.",
    icon: BarChart3
  },
  {
    title: "Faturamento por serviço",
    text: "Compare serviços mais vendidos e valores previstos a partir da agenda.",
    icon: DollarSign
  },
  {
    title: "Produtividade por profissional",
    text: "Veja atendimentos por responsável, finalizados, cancelados e não comparecimentos.",
    icon: UserRoundCheck
  },
  {
    title: "Cancelamentos e faltas",
    text: "Identifique perdas recorrentes e crie ações de confirmação para reduzir ausências.",
    icon: CalendarX2
  },
  {
    title: "Horários mais movimentados",
    text: "Descubra períodos de pico para ajustar disponibilidade e equipe.",
    icon: Clock3
  }
];

export default function Relatorios() {
  return (
    <section className="content-stack">
      <section className="panel intro-panel">
        <div>
          <span className="eyebrow">Inteligência de gestão</span>
          <h2>Relatórios para transformar agenda em decisão</h2>
          <p>
            Esta área prepara o caminho para análises gerenciais do AgendaFlex.
            No MVP, o dashboard já mostra indicadores básicos; aqui ficam os
            relatórios que podem virar filtros reais na próxima etapa.
          </p>
        </div>
      </section>

      <section className="report-grid">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <article className="report-card" key={report.title}>
              <Icon size={22} />
              <h3>{report.title}</h3>
              <p>{report.text}</p>
            </article>
          );
        })}
      </section>
    </section>
  );
}
