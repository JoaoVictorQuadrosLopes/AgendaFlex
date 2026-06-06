const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const clienteController = require("../controllers/clienteController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", clienteController.listar);
router.post("/", clienteController.criar);
router.put("/:id", clienteController.atualizar);

module.exports = router;
