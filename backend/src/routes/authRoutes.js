const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { rateLimit } = require("../middlewares/rateLimitMiddleware");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "auth",
  message: "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente."
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
