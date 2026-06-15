const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const profissionalRoutes = require("./routes/profissionalRoutes");
const servicoRoutes = require("./routes/servicoRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assinaturaRoutes = require("./routes/assinaturaRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const publicAgendamentoRoutes = require("./routes/publicAgendamentoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (env.isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
});

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem nao permitida pelo CORS"));
    }
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.get("/", (req, res) => {
  res.json({ mensagem: "API AgendaFlex rodando com sucesso" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "agendaflex-api",
    environment: env.NODE_ENV
  });
});

app.get("/ready", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ready",
      database: "ok"
    });
  } catch (error) {
    error.statusCode = 503;
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/profissionais", profissionalRoutes);
app.use("/api/servicos", servicoRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assinatura", assinaturaRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/public/agendar", publicAgendamentoRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    mensagem: err.statusCode ? err.message : "Erro interno no servidor",
    code: err.code,
    details: err.details
  });
});

app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
