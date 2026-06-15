const PLANS = {
  starter: {
    plano: "starter",
    nome: "Essencial",
    valor_mensal: 59,
    limites: {
      usuarios: 3,
      profissionais: 3,
      agendamentos_mes: 120
    }
  },
  professional: {
    plano: "professional",
    nome: "Profissional",
    valor_mensal: 119,
    limites: {
      usuarios: 10,
      profissionais: 15,
      agendamentos_mes: 800
    }
  },
  business: {
    plano: "business",
    nome: "Empresarial",
    valor_mensal: 0,
    limites: {
      usuarios: null,
      profissionais: null,
      agendamentos_mes: null
    }
  }
};

function getPlan(planId) {
  return PLANS[planId] || PLANS.starter;
}

function listPlans() {
  return Object.values(PLANS);
}

module.exports = { PLANS, getPlan, listPlans };
