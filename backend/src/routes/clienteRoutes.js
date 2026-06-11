const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const clienteController = require("../controllers/clienteController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", authorize("ADMIN", "RECEPCAO", "PROFISSIONAL"), clienteController.listar);
router.post("/", authorize("ADMIN", "RECEPCAO"), clienteController.criar);
router.put("/:id", authorize("ADMIN", "RECEPCAO"), clienteController.atualizar);
router.delete("/:id", authorize("ADMIN"), clienteController.excluir);

module.exports = router;
