import React from "react";

const labels = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_ATENDIMENTO: "Em atendimento",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  NAO_COMPARECEU: "Nao compareceu"
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
