const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);
router.get("/resumo", authorize("ADMIN", "RECEPCAO"), dashboardController.resumo);

module.exports = router;
