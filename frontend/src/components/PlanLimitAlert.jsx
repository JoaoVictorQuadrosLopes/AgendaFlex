import React from "react";
import { ArrowUpRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { getPlanLimitDetails } from "../utils/apiErrors.js";

const resourceLabels = {
  usuarios: "usuarios",
  profissionais: "profissionais",
  agendamentos_mes: "agendamentos neste mes"
};

export default function PlanLimitAlert({ error }) {
  const details = getPlanLimitDetails(error);
  const recurso = resourceLabels[details?.recurso] || "recursos";

  return (
    <div className="plan-limit-alert">
      <Crown size={20} />
      <div>
        <strong>Limite do plano atingido</strong>
        <span>
          Este plano chegou ao limite de {recurso}
          {details?.limite ? ` (${details.uso}/${details.limite}).` : "."} Faca upgrade para continuar crescendo.
        </span>
      </div>
      <Link className="outline-button" to="/app/assinatura">
        Ver planos
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
