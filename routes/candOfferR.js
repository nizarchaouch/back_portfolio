const express = require("express");
const router = express.Router();
const candofferController = require("../controllers/candOfferController");

router.post("/add", candofferController.add);

module.exports = router;
