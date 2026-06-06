const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);
router.get("/resumo", dashboardController.resumo);

module.exports = router;
