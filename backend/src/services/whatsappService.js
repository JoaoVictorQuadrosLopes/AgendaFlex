function formatarNumero(numero) {
  const limpo = String(numero || "").replace(/\D/g, "");

  if (!limpo) {
    return "";
  }

  return limpo.startsWith("55") ? limpo : `55${limpo}`;
}

async function enviarMensagemTexto(telefone, mensagem) {
  const numero = formatarNumero(telefone);
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";

  if (!numero || !mensagem || !accessToken || !phoneNumberId) {
    return null;
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numero,
      type: "text",
      text: {
        preview_url: false,
        body: mensagem
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Erro ao enviar mensagem pela WhatsApp Cloud API", data);
    return null;
  }

  return data;
}

module.exports = { enviarMensagemTexto, formatarNumero };
