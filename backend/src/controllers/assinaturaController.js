const pool = require("../config/database");

const PLANOS = {
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

const MERCADO_PAGO_API_URL = "https://api.mercadopago.com";

function getPublicUrl() {
  return process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || "";
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || "http://127.0.0.1:5173";
}

function mapearStatusMercadoPago(status) {
  const statusMap = {
    authorized: "ATIVA",
    pending: "PENDENTE",
    paused: "PAUSADA",
    cancelled: "CANCELADA",
    canceled: "CANCELADA"
  };

  return statusMap[status] || "PENDENTE";
}

async function mercadoPagoRequest(path, options = {}) {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    const error = new Error("MERCADO_PAGO_ACCESS_TOKEN nao configurado no .env");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${MERCADO_PAGO_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Erro na API do Mercado Pago");
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function buscarOuCriarAssinatura(empresaId) {
  const existente = await pool.query(
    "SELECT * FROM assinaturas WHERE empresa_id = $1",
    [empresaId]
  );

  if (existente.rows[0]) {
    return existente.rows[0];
  }

  const criada = await pool.query(
    `INSERT INTO assinaturas (empresa_id, plano, valor_mensal)
     VALUES ($1, 'starter', $2)
     RETURNING *`,
    [empresaId, PLANOS.starter.valor_mensal]
  );

  return criada.rows[0];
}

async function obter(req, res) {
  const assinatura = await buscarOuCriarAssinatura(req.usuario.empresa_id);
  const plano = PLANOS[assinatura.plano] || PLANOS.starter;

  res.json({
    ...assinatura,
    nome: plano.nome,
    limites: plano.limites,
    planos: Object.values(PLANOS)
  });
}

async function atualizar(req, res) {
  const { plano } = req.body;
  const planoEscolhido = PLANOS[plano];

  if (!planoEscolhido) {
    return res.status(400).json({ mensagem: "Plano invalido" });
  }

  const result = await pool.query(
    `INSERT INTO assinaturas (empresa_id, plano, valor_mensal)
     VALUES ($1, $2, $3)
     ON CONFLICT (empresa_id)
     DO UPDATE SET
       plano = EXCLUDED.plano,
       valor_mensal = EXCLUDED.valor_mensal,
       status = 'ATIVA',
       proxima_cobranca = (CURRENT_DATE + INTERVAL '30 days')::date,
       atualizado_em = CURRENT_TIMESTAMP
     RETURNING *`,
    [req.usuario.empresa_id, plano, planoEscolhido.valor_mensal]
  );

  res.json({
    ...result.rows[0],
    nome: planoEscolhido.nome,
    limites: planoEscolhido.limites
  });
}

async function criarCheckout(req, res) {
  const { plano } = req.body;
  const planoEscolhido = PLANOS[plano];

  if (!planoEscolhido) {
    return res.status(400).json({ mensagem: "Plano invalido" });
  }

  if (plano === "business") {
    return res.status(400).json({
      mensagem: "O plano empresarial exige contato comercial antes da contratacao."
    });
  }

  const usuarioResult = await pool.query(
    "SELECT email, nome FROM usuarios WHERE id = $1 AND empresa_id = $2",
    [req.usuario.id, req.usuario.empresa_id]
  );
  const usuario = usuarioResult.rows[0];

  if (!usuario?.email) {
    return res.status(400).json({ mensagem: "Usuario sem e-mail para iniciar pagamento" });
  }

  const externalReference = `empresa:${req.usuario.empresa_id}:plano:${plano}:usuario:${req.usuario.id}`;
  const publicUrl = getPublicUrl();
  const notificationUrl = publicUrl
    ? `${publicUrl}/api/assinatura/webhook?source_news=webhooks`
    : undefined;

  const body = {
    reason: `AgendaFlex - Plano ${planoEscolhido.nome}`,
    external_reference: externalReference,
    payer_email: usuario.email,
    back_url: `${getFrontendUrl()}/app/assinatura`,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: planoEscolhido.valor_mensal,
      currency_id: "BRL"
    },
    status: "pending"
  };

  if (notificationUrl) {
    body.notification_url = notificationUrl;
  }

  const preapproval = await mercadoPagoRequest("/preapproval", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const checkoutUrl = preapproval.init_point || preapproval.sandbox_init_point;

  const assinaturaResult = await pool.query(
    `INSERT INTO assinaturas
       (empresa_id, plano, status, valor_mensal, provider, external_reference, mercado_pago_preapproval_id, checkout_url)
     VALUES ($1, $2, 'PENDENTE', $3, 'MERCADO_PAGO', $4, $5, $6)
     ON CONFLICT (empresa_id)
     DO UPDATE SET
       plano = EXCLUDED.plano,
       status = 'PENDENTE',
       valor_mensal = EXCLUDED.valor_mensal,
       provider = 'MERCADO_PAGO',
       external_reference = EXCLUDED.external_reference,
       mercado_pago_preapproval_id = EXCLUDED.mercado_pago_preapproval_id,
       checkout_url = EXCLUDED.checkout_url,
       atualizado_em = CURRENT_TIMESTAMP
     RETURNING *`,
    [req.usuario.empresa_id, plano, planoEscolhido.valor_mensal, externalReference, preapproval.id, checkoutUrl]
  );

  res.status(201).json({
    assinatura: {
      ...assinaturaResult.rows[0],
      nome: planoEscolhido.nome,
      limites: planoEscolhido.limites
    },
    checkout_url: checkoutUrl,
    mercado_pago_preapproval_id: preapproval.id
  });
}

async function sincronizarMercadoPago(req, res) {
  const assinatura = await buscarOuCriarAssinatura(req.usuario.empresa_id);

  if (!assinatura.mercado_pago_preapproval_id) {
    return res.status(400).json({ mensagem: "Nenhuma assinatura do Mercado Pago vinculada" });
  }

  const preapproval = await mercadoPagoRequest(`/preapproval/${assinatura.mercado_pago_preapproval_id}`);
  const status = mapearStatusMercadoPago(preapproval.status);

  const result = await pool.query(
    `UPDATE assinaturas
     SET status = $1,
         checkout_url = COALESCE($2, checkout_url),
         atualizado_em = CURRENT_TIMESTAMP
     WHERE empresa_id = $3
     RETURNING *`,
    [status, preapproval.init_point || preapproval.sandbox_init_point || null, req.usuario.empresa_id]
  );

  const plano = PLANOS[result.rows[0].plano] || PLANOS.starter;

  res.json({
    ...result.rows[0],
    nome: plano.nome,
    limites: plano.limites
  });
}

async function webhook(req, res) {
  const eventType = req.body?.type || req.query?.type;
  const dataId = req.body?.data?.id || req.query?.["data.id"] || req.query?.id;

  res.sendStatus(200);

  if (!dataId || !["subscription_preapproval", "preapproval"].includes(eventType)) {
    return;
  }

  try {
    const preapproval = await mercadoPagoRequest(`/preapproval/${dataId}`);
    const status = mapearStatusMercadoPago(preapproval.status);

    await pool.query(
      `UPDATE assinaturas
       SET status = $1,
           mercado_pago_preapproval_id = $2,
           checkout_url = COALESCE($3, checkout_url),
           atualizado_em = CURRENT_TIMESTAMP
       WHERE mercado_pago_preapproval_id = $2
          OR external_reference = $4`,
      [
        status,
        preapproval.id,
        preapproval.init_point || preapproval.sandbox_init_point || null,
        preapproval.external_reference || null
      ]
    );
  } catch (error) {
    console.error("Erro ao processar webhook Mercado Pago", error);
  }
}

module.exports = { obter, atualizar, criarCheckout, sincronizarMercadoPago, webhook };
