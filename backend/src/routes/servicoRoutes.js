const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const servicoController = require("../controllers/servicoController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", authorize("ADMIN", "RECEPCAO", "PROFISSIONAL"), servicoController.listar);
router.post("/", authorize("ADMIN", "RECEPCAO"), servicoController.criar);
router.put("/:id", authorize("ADMIN", "RECEPCAO"), servicoController.atualizar);
router.delete("/:id", authorize("ADMIN"), servicoController.excluir);

module.exports = router;
