const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      tipo: usuario.tipo
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

async function register(req, res) {
  const client = await pool.connect();

  try {
    const { empresa, usuario } = req.body;

    if (!empresa?.nome || !empresa?.tipo_negocio || !usuario?.nome || !usuario?.email || !usuario?.senha) {
      return res.status(400).json({ mensagem: "Dados obrigatorios nao informados" });
    }

    await client.query("BEGIN");

    const empresaResult = await client.query(
      `INSERT INTO empresas (nome, tipo_negocio, documento, telefone, endereco)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [empresa.nome, empresa.tipo_negocio, empresa.documento || null, empresa.telefone || null, empresa.endereco || null]
    );

    const senhaHash = await bcrypt.hash(usuario.senha, 10);
    const usuarioResult = await client.query(
      `INSERT INTO usuarios (empresa_id, nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4, 'ADMIN')
       RETURNING id, empresa_id, nome, email, tipo, criado_em`,
      [empresaResult.rows[0].id, usuario.nome, usuario.email, senhaHash]
    );

    await client.query(
      `INSERT INTO assinaturas (empresa_id, plano, valor_mensal)
       VALUES ($1, 'starter', 59.00)`,
      [empresaResult.rows[0].id]
    );

    await client.query("COMMIT");

    const usuarioCriado = usuarioResult.rows[0];
    return res.status(201).json({
      empresa: empresaResult.rows[0],
      usuario: usuarioCriado,
      token: gerarToken(usuarioCriado)
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({ mensagem: "E-mail ja cadastrado" });
    }

    throw error;
  } finally {
    client.release();
  }
}

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "E-mail e senha sao obrigatorios" });
  }

  const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
  const usuario = result.rows[0];

  if (!usuario) {
    return res.status(401).json({ mensagem: "Credenciais invalidas" });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    return res.status(401).json({ mensagem: "Credenciais invalidas" });
  }

  delete usuario.senha;

  return res.json({
    usuario,
    token: gerarToken(usuario)
  });
}

module.exports = { register, login };
