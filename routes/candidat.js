const express = require("express");
const router = express.Router();
const candController = require("../controllers/candController");

router.post("/signup", candController.signup);
router.post("/login", candController.login);
router.post("/logout", candController.logout);

router.put("/update/:id", candController.updateCand);

router.get("/", candController.getCand);

module.exports = router;
