const express = require("express");
const publicAgendamentoController = require("../controllers/publicAgendamentoController");

const router = express.Router();

router.get("/:empresaId", publicAgendamentoController.obterEmpresa);
router.get("/:empresaId/horarios", publicAgendamentoController.listarHorarios);
router.post("/:empresaId/agendamentos", publicAgendamentoController.criarAgendamento);

module.exports = router;
