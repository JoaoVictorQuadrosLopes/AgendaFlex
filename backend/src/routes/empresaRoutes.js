const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizationMiddleware");
const empresaController = require("../controllers/empresaController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", authorize("ADMIN"), empresaController.obter);
router.put("/", authorize("ADMIN"), empresaController.atualizar);

module.exports = router;
