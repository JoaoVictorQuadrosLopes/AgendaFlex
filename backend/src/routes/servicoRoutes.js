const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const servicoController = require("../controllers/servicoController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", servicoController.listar);
router.post("/", servicoController.criar);
router.put("/:id", servicoController.atualizar);
router.delete("/:id", servicoController.excluir);

module.exports = router;
