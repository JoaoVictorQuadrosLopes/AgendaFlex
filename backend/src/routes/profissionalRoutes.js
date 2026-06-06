const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const profissionalController = require("../controllers/profissionalController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", profissionalController.listar);
router.post("/", profissionalController.criar);
router.put("/:id", profissionalController.atualizar);
router.delete("/:id", profissionalController.excluir);

module.exports = router;
