const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const profissionalController = require("../controllers/profissionalController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", authorize("ADMIN", "RECEPCAO", "PROFISSIONAL"), profissionalController.listar);
router.post("/", authorize("ADMIN"), profissionalController.criar);
router.put("/:id", authorize("ADMIN"), profissionalController.atualizar);
router.delete("/:id", authorize("ADMIN"), profissionalController.excluir);

module.exports = router;
