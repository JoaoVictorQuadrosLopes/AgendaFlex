const pool = require("../config/database");
const { verificarLimiteDisponivel } = require("../services/planLimitService");

const HORA_ABERTURA = "08:00";
const HORA_FECHAMENTO = "18:00";
const INTERVALO_MINUTOS = 30;

function paraMinutos(hora) {
  const [hours, minutes] = String(hora).slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function paraHora(minutos) {
  const hours = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mins = String(minutos % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

function somarMinutos(hora, minutos) {
  return paraHora(paraMinutos(hora) + Number(minutos));
}

function normalizarTelefone(telefone) {
  return String(telefone || "").replace(/\D/g, "");
}

function obterFiltroEmpresa(referencia) {
  const valor = String(referencia || "").trim().toLowerCase();

  if (!valor) {
    return null;
  }

  if (/^\d+$/.test(valor)) {
    return {
      where: "id = $1",
      params: [Number(valor)]
    };
  }

  return {
    where: "agendamento_slug = $1",
    params: [valor]
  };
}

async function resolverEmpresa(referencia, query = pool) {
  const filtro = obterFiltroEmpresa(referencia);

  if (!filtro) {
    return null;
  }

  const result = await query.query(
    `SELECT id, nome, tipo_negocio, telefone, endereco,
            termo_cliente, termo_profissional, termo_servico, agendamento_slug
     FROM empresas
     WHERE ${filtro.where}`,
    filtro.params
  );

  return result.rows[0] || null;
}

async function obterEmpresa(req, res) {
  if (!obterFiltroEmpresa(req.params.empresaId)) {
    return res.status(400).json({ mensagem: "Empresa invalida" });
  }

  const empresa = await resolverEmpresa(req.params.empresaId);

  if (!empresa) {
    return res.status(404).json({ mensagem: "Empresa nao encontrada" });
  }

  const [servicosResult, profissionaisResult] = await Promise.all([
    pool.query(
      `SELECT id, nome, descricao, duracao_minutos, valor
       FROM servicos
       WHERE empresa_id = $1 AND ativo IS NOT FALSE
       ORDER BY nome`,
      [empresa.id]
    ),
    pool.query(
      `SELECT id, nome, funcao
       FROM profissionais
       WHERE empresa_id = $1 AND ativo IS NOT FALSE
       ORDER BY nome`,
      [empresa.id]
    )
  ]);

  res.json({
    empresa,
    servicos: servicosResult.rows,
    profissionais: profissionaisResult.rows,
    expediente: {
      abertura: HORA_ABERTURA,
      fechamento: HORA_FECHAMENTO,
      intervalo_minutos: INTERVALO_MINUTOS
    }
  });
}

async function listarHorarios(req, res) {
  const { servico_id, profissional_id, data } = req.query;
  const empresa = await resolverEmpresa(req.params.empresaId);

  if (!servico_id || !profissional_id || !data) {
    return res.status(400).json({ mensagem: "Servico, profissional e data sao obrigatorios" });
  }

  if (!empresa) {
    return res.status(404).json({ mensagem: "Empresa nao encontrada" });
  }

  const servicoResult = await pool.query(
    `SELECT id, duracao_minutos
     FROM servicos
     WHERE id = $1 AND empresa_id = $2 AND ativo IS NOT FALSE`,
    [servico_id, empresa.id]
  );

  const profissionalResult = await pool.query(
    `SELECT id
     FROM profissionais
     WHERE id = $1 AND empresa_id = $2 AND ativo IS NOT FALSE`,
    [profissional_id, empresa.id]
  );

  if (!servicoResult.rows[0] || !profissionalResult.rows[0]) {
    return res.status(404).json({ mensagem: "Servico ou profissional nao encontrado" });
  }

  const duracao = Number(servicoResult.rows[0].duracao_minutos || 30);
  const agendamentosResult = await pool.query(
    `SELECT hora_inicio, hora_fim
     FROM agendamentos
     WHERE empresa_id = $1
       AND profissional_id = $2
       AND data_agendamento = $3
       AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')`,
    [empresa.id, profissional_id, data]
  );

  const ocupados = agendamentosResult.rows.map((item) => ({
    inicio: paraMinutos(item.hora_inicio),
    fim: paraMinutos(item.hora_fim)
  }));

  const abertura = paraMinutos(HORA_ABERTURA);
  const fechamento = paraMinutos(HORA_FECHAMENTO);
  const horarios = [];

  for (let inicio = abertura; inicio + duracao <= fechamento; inicio += INTERVALO_MINUTOS) {
    const fim = inicio + duracao;
    const indisponivel = ocupados.some((ocupado) => inicio < ocupado.fim && fim > ocupado.inicio);

    horarios.push({
      hora_inicio: paraHora(inicio),
      hora_fim: paraHora(fim),
      disponivel: !indisponivel
    });
  }

  res.json(horarios);
}

async function criarAgendamento(req, res) {
  const {
    cliente_nome,
    cliente_telefone,
    cliente_email,
    servico_id,
    profissional_id,
    data_agendamento,
    hora_inicio,
    observacoes
  } = req.body;

  if (!cliente_nome || !cliente_telefone || !servico_id || !profissional_id || !data_agendamento || !hora_inicio) {
    return res.status(400).json({ mensagem: "Preencha os dados obrigatorios para agendar" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const empresa = await resolverEmpresa(req.params.empresaId, client);

    if (!empresa) {
      throw new Error("Empresa nao encontrada");
    }

    await verificarLimiteDisponivel(empresa.id, "agendamentos_mes");

    const servicoResult = await client.query(
      `SELECT id, nome, duracao_minutos
       FROM servicos
       WHERE id = $1 AND empresa_id = $2 AND ativo IS NOT FALSE`,
      [servico_id, empresa.id]
    );

    const profissionalResult = await client.query(
      `SELECT id, nome
       FROM profissionais
       WHERE id = $1 AND empresa_id = $2 AND ativo IS NOT FALSE`,
      [profissional_id, empresa.id]
    );

    const servico = servicoResult.rows[0];
    const profissional = profissionalResult.rows[0];

    if (!servico || !profissional) {
      throw new Error("Servico ou profissional nao encontrado");
    }

    const horaFim = somarMinutos(hora_inicio, servico.duracao_minutos || 30);
    const conflito = await client.query(
      `SELECT id FROM agendamentos
       WHERE empresa_id = $1
         AND profissional_id = $2
         AND data_agendamento = $3
         AND status NOT IN ('CANCELADO', 'NAO_COMPARECEU')
         AND hora_inicio < $5
         AND hora_fim > $4`,
      [empresa.id, profissional_id, data_agendamento, hora_inicio, horaFim]
    );

    if (conflito.rows.length > 0) {
      throw new Error("Horario indisponivel para este profissional");
    }

    const telefoneLimpo = normalizarTelefone(cliente_telefone);
    const clienteExistente = await client.query(
      `SELECT id FROM clientes
       WHERE empresa_id = $1
         AND regexp_replace(COALESCE(telefone, ''), '\\D', '', 'g') = $2
       LIMIT 1`,
      [empresa.id, telefoneLimpo]
    );

    let clienteId = clienteExistente.rows[0]?.id;

    if (!clienteId) {
      const clienteCriado = await client.query(
        `INSERT INTO clientes (empresa_id, nome, telefone, email, observacoes)
         VALUES ($1, $2, $3, $4, 'Criado pelo agendamento online')
         RETURNING id`,
        [empresa.id, cliente_nome, telefoneLimpo, cliente_email || null]
      );
      clienteId = clienteCriado.rows[0].id;
    }

    const agendamento = await client.query(
      `INSERT INTO agendamentos
         (empresa_id, cliente_id, profissional_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, origem, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'AGENDADO', 'ONLINE', $8)
       RETURNING *`,
      [
        empresa.id,
        clienteId,
        profissional_id,
        servico_id,
        data_agendamento,
        hora_inicio,
        horaFim,
        observacoes || null
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      mensagem: "Agendamento criado com sucesso",
      agendamento: {
        ...agendamento.rows[0],
        cliente_nome,
        cliente_telefone: telefoneLimpo,
        servico_nome: servico.nome,
        profissional_nome: profissional.nome
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(error.statusCode || (error.message.includes("indisponivel") ? 409 : 400)).json({
      mensagem: error.message,
      code: error.code,
      details: error.details
    });
  } finally {
    client.release();
  }
}

module.exports = { obterEmpresa, listarHorarios, criarAgendamento };
