const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const empresaController = require("../controllers/empresaController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", empresaController.obter);
router.put("/", empresaController.atualizar);

module.exports = router;
