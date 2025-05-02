const express = require("express");

const { authenticateViaSecret } = require("../services/verifyAuth");
const { generateBearer } = require("../controllers/adminController");

const router = express.Router();

router.post("/jwt", authenticateViaSecret, generateBearer);

module.exports = router;
