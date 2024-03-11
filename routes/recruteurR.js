const express = require("express");
const router = express.Router();
const recruController = require("../controllers/recruController");

router.post("/signup", recruController.signup);
router.post("/login", recruController.login);
router.post("/logout", recruController.logout);

router.get("/user", recruController.getCand);

module.exports = router;
