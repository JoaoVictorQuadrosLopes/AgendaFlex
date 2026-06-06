const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const assinaturaController = require("../controllers/assinaturaController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", assinaturaController.obter);
router.put("/", assinaturaController.atualizar);

module.exports = router;
