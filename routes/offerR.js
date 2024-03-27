const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");

router.post("/add", offerController.add);

module.exports = router;
