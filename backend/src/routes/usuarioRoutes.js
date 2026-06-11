const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("ADMIN"));
router.get("/", usuarioController.listar);
router.post("/", usuarioController.criar);
router.put("/:id", usuarioController.atualizar);
router.delete("/:id", usuarioController.excluir);

module.exports = router;
