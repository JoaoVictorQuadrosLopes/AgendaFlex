const express = require("express");
const whatsappController = require("../controllers/whatsappController");

const router = express.Router();

router.get("/webhook", whatsappController.verificarWebhook);
router.post("/webhook", whatsappController.receberWebhook);
router.post("/webhook/messages-upsert", whatsappController.receberWebhook);

module.exports = router;
