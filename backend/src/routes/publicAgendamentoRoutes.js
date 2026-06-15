const express = require("express");
const publicAgendamentoController = require("../controllers/publicAgendamentoController");
const { rateLimit } = require("../middlewares/rateLimitMiddleware");

const router = express.Router();
const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: "public-agenda-read",
  message: "Muitas consultas nesta agenda. Aguarde um momento e tente novamente."
});
const publicCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  keyPrefix: "public-agenda-create",
  message: "Muitas tentativas de agendamento. Aguarde alguns minutos e tente novamente."
});

router.get("/:empresaId", publicReadLimiter, publicAgendamentoController.obterEmpresa);
router.get("/:empresaId/horarios", publicReadLimiter, publicAgendamentoController.listarHorarios);
router.post("/:empresaId/agendamentos", publicCreateLimiter, publicAgendamentoController.criarAgendamento);

module.exports = router;
