const express = require("express");
const router = express.Router();
const candofferController = require("../controllers/candOfferController");

router.post("/add", candofferController.add);

router.get("/showCand/:id", candofferController.showCandOffer);
router.get("/showOfferApp/:id", candofferController.showOfferApp);

module.exports = router;
