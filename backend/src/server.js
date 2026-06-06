const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const authRoutes = require("./routes/authRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const profissionalRoutes = require("./routes/profissionalRoutes");
const servicoRoutes = require("./routes/servicoRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assinaturaRoutes = require("./routes/assinaturaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API AgendaFlex rodando com sucesso" });
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/profissionais", profissionalRoutes);
app.use("/api/servicos", servicoRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assinatura", assinaturaRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensagem: "Erro interno no servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
