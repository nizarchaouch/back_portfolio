const express = require("express");
const router = express.Router();
const recruController = require("../controllers/recruController");

router.post("/signup/recruteur", recruController.signup);
router.post("/login", recruController.login);
router.post("/logout", recruController.logout);



module.exports = router;
