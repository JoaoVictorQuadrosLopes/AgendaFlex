const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const agendamentoController = require("../controllers/agendamentoController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", authorize("ADMIN", "RECEPCAO", "PROFISSIONAL"), agendamentoController.listar);
router.post("/", authorize("ADMIN", "RECEPCAO"), agendamentoController.criar);
router.put("/:id", authorize("ADMIN", "RECEPCAO"), agendamentoController.atualizar);
router.post("/:id/whatsapp-confirmacao", authorize("ADMIN", "RECEPCAO"), agendamentoController.enviarConfirmacaoWhatsapp);
router.patch("/:id/status", authorize("ADMIN", "RECEPCAO", "PROFISSIONAL"), agendamentoController.alterarStatus);
router.delete("/:id", authorize("ADMIN"), agendamentoController.excluir);

module.exports = router;
