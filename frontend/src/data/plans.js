export const plans = [
  {
    id: "starter",
    name: "Essencial",
    price: "R$ 59",
    period: "/mês",
    description: "Para profissionais autônomos e pequenos negócios iniciando a agenda online.",
    highlighted: false,
    features: [
      "1 empresa cadastrada",
      "Até 3 usuários",
      "Clientes, serviços e profissionais",
      "Agenda diária com status",
      "Confirmação manual por WhatsApp"
    ]
  },
  {
    id: "professional",
    name: "Profissional",
    price: "R$ 119",
    period: "/mês",
    description: "Para equipes que precisam controlar atendimentos, relatórios e rotina comercial.",
    highlighted: true,
    features: [
      "Até 10 usuários",
      "Agenda por profissional",
      "Relatórios gerenciais",
      "Personalização por segmento",
      "Suporte prioritário"
    ]
  },
  {
    id: "business",
    name: "Empresarial",
    price: "Sob consulta",
    period: "",
    description: "Para operações com múltiplas unidades, regras específicas e integrações.",
    highlighted: false,
    features: [
      "Usuários e unidades sob demanda",
      "Permissões por cargo",
      "Módulos financeiro e estoque",
      "Integrações com WhatsApp/API",
      "Implantação acompanhada"
    ]
  }
];
