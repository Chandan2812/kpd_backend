const express = require("express");
const router = express.Router();
const sellController = require("../controllers/adminApproval.controller");

// Approve a Sell entry
router.post("/approve/:id", sellController.approveSell);

module.exports = router;
