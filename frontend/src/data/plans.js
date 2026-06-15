export const plans = [
  {
    id: "starter",
    name: "Essencial",
    price: "R$ 59",
    period: "/mes",
    description: "Para profissionais autonomos e pequenos negocios iniciando a agenda online.",
    highlighted: false,
    limits: {
      usuarios: 3,
      profissionais: 3,
      agendamentos_mes: 120
    },
    features: [
      "Ate 3 usuarios",
      "Ate 3 profissionais",
      "Ate 120 agendamentos por mes",
      "Clientes, servicos e agenda diaria",
      "Confirmacao manual por WhatsApp"
    ]
  },
  {
    id: "professional",
    name: "Profissional",
    price: "R$ 119",
    period: "/mes",
    description: "Para equipes que precisam controlar atendimentos, relatorios e rotina comercial.",
    highlighted: true,
    limits: {
      usuarios: 10,
      profissionais: 15,
      agendamentos_mes: 800
    },
    features: [
      "Ate 10 usuarios",
      "Ate 15 profissionais",
      "Ate 800 agendamentos por mes",
      "Relatorios gerenciais",
      "Suporte prioritario"
    ]
  },
  {
    id: "business",
    name: "Empresarial",
    price: "Sob consulta",
    period: "",
    description: "Para operacoes com multiplas unidades, regras especificas e integracoes.",
    highlighted: false,
    limits: {
      usuarios: null,
      profissionais: null,
      agendamentos_mes: null
    },
    features: [
      "Usuarios e profissionais sob demanda",
      "Agendamentos mensais sob demanda",
      "Permissoes por cargo",
      "Integracoes com WhatsApp/API",
      "Implantacao acompanhada"
    ]
  }
];
