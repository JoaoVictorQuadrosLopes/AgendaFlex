const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const agendamentoController = require("../controllers/agendamentoController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", agendamentoController.listar);
router.post("/", agendamentoController.criar);
router.patch("/:id/status", agendamentoController.alterarStatus);
router.delete("/:id", agendamentoController.excluir);

module.exports = router;
