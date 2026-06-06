import React, { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Crown, Loader2, ShieldCheck } from "lucide-react";
import { plans } from "../data/plans.js";
import api from "../services/api.js";

export default function Assinatura() {
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [assinatura, setAssinatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState("");
  const [erro, setErro] = useState("");

  const planoAtual = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan) || plans[0],
    [selectedPlan]
  );

  useEffect(() => {
    carregarAssinatura();
  }, []);

  async function carregarAssinatura() {
    setLoading(true);
    setErro("");

    try {
      const { data } = await api.get("/assinatura");
      setAssinatura(data);
      setSelectedPlan(data.plano || "starter");
    } catch (error) {
      setErro(error.response?.data?.mensagem || "Nao foi possivel carregar a assinatura.");
    } finally {
      setLoading(false);
    }
  }

  async function escolherPlano(planId) {
    setSavingPlan(planId);
    setErro("");

    try {
      const { data } = await api.put("/assinatura", { plano: planId });
      setAssinatura(data);
      setSelectedPlan(data.plano);
    } catch (error) {
      setErro(error.response?.data?.mensagem || "Nao foi possivel alterar o plano.");
    } finally {
      setSavingPlan("");
    }
  }

  return (
    <section className="content-stack">
      {erro && <div className="alert-error">{erro}</div>}

      <section className="panel subscription-summary">
        <div>
          <span className="eyebrow">Assinatura atual</span>
          <h2>{planoAtual.name}</h2>
          <p>{planoAtual.description}</p>
          {assinatura?.proxima_cobranca && (
            <span className="subscription-meta">
              Proxima cobranca em {new Date(assinatura.proxima_cobranca).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
        <div className="subscription-seal">
          <Crown size={22} />
          <span>{loading ? "Carregando..." : `${planoAtual.price}${planoAtual.period}`}</span>
        </div>
      </section>

      <section className="pricing-grid app-pricing">
        {plans.map((plan) => (
          <article className={`pricing-card ${plan.highlighted ? "highlighted" : ""}`} key={plan.id}>
            {plan.id === selectedPlan && <span className="plan-tag">Plano atual</span>}
            {plan.highlighted && plan.id !== selectedPlan && <span className="plan-tag">Recomendado</span>}
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <div className="plan-price">
              <strong>{plan.price}</strong>
              <span>{plan.period}</span>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={17} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={plan.id === selectedPlan ? "outline-button full" : "primary-button"}
              disabled={Boolean(savingPlan) || loading}
              type="button"
              onClick={() => escolherPlano(plan.id)}
            >
              {savingPlan === plan.id ? <Loader2 className="spin" size={18} /> : <CreditCard size={18} />}
              {plan.id === selectedPlan ? "Selecionado" : "Escolher plano"}
            </button>
          </article>
        ))}
      </section>

      <section className="panel billing-note">
        <ShieldCheck size={22} />
        <div>
          <strong>Pagamento ainda não integrado</strong>
          <span>
            A escolha do plano agora fica salva no banco da empresa. A cobrança recorrente
            pode ser integrada depois com Stripe, Mercado Pago ou outro provedor.
          </span>
        </div>
      </section>
    </section>
  );
}
