const express = require("express");
const router = express.Router();
const recruController = require("../controllers/recruController");

router.post("/recruteur/signup", recruController.signup);
router.post("/recruteur/login", recruController.login);
router.post("/recruteur/logout", recruController.logout);

router.get("/recruteur/user", recruController.getCand);

module.exports = router;
