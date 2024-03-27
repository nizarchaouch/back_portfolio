const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");

router.post("/add", offerController.add);

router.put("/update/:id", offerController.update);

router.get("/show/:id", offerController.show);

router.delete("/delete/:id", offerController.deleteOffer);

module.exports = router;
