const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const assinaturaController = require("../controllers/assinaturaController");

const router = express.Router();

router.post("/webhook", assinaturaController.webhook);

router.use(authMiddleware);
router.use(authorize("ADMIN"));
router.get("/", assinaturaController.obter);
router.put("/", assinaturaController.atualizar);
router.post("/checkout", assinaturaController.criarCheckout);
router.post("/sincronizar", assinaturaController.sincronizarMercadoPago);

module.exports = router;
