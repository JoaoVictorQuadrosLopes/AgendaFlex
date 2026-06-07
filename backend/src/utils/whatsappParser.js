function normalizarTexto(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function limparTelefone(valor = "") {
  return valor.replace(/\D/g, "");
}

function parseConfirmacaoExistente(texto) {
  const match = texto.match(/(?:confirmar|confirmo|sim)\s*#?\s*(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    tipo: "CONFIRMAR_AGENDAMENTO",
    agendamento_id: Number(match[1])
  };
}

function parseCriacaoAgendamento(texto, telefoneCliente) {
  const partes = texto
    .split(";")
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length < 6) {
    return null;
  }

  const comando = normalizarTexto(partes[0]);

  if (!["agendar", "confirmar", "confirmo"].includes(comando)) {
    return null;
  }

  const [dia, mes, ano] = (partes[4] || "").split("/").map((item) => item.padStart(2, "0"));
  const dataISO = partes[4]?.includes("/")
    ? `${ano}-${mes}-${dia}`
    : partes[4];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO) || !/^\d{2}:\d{2}$/.test(partes[5] || "")) {
    return null;
  }

  return {
    tipo: "CRIAR_AGENDAMENTO",
    cliente_nome: partes[1],
    servico_nome: partes[2],
    profissional_nome: partes[3],
    data_agendamento: dataISO,
    hora_inicio: partes[5],
    cliente_telefone: limparTelefone(telefoneCliente),
    observacoes: "Criado automaticamente por confirmacao via WhatsApp"
  };
}

function interpretarMensagemWhatsApp(texto, telefoneCliente) {
  const confirmacao = parseConfirmacaoExistente(texto);

  if (confirmacao) {
    return confirmacao;
  }

  return parseCriacaoAgendamento(texto, telefoneCliente);
}

module.exports = {
  interpretarMensagemWhatsApp,
  limparTelefone,
  normalizarTexto
};
