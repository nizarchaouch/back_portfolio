const express = require("express");
const router = express.Router();
const candofferController = require("../controllers/candOfferController");

router.post("/add", candofferController.add);

router.get("/showCand/:id", candofferController.showCandOffer);
router.get("/countApp/:id", candofferController.countApp);

module.exports = router;
