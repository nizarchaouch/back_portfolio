const express = require("express");
const router = express.Router();
const candContoller = require("../controllers/candController");

router.post("/signup", candContoller.signup);
router.post("/login", candContoller.login);
router.post("/logout", candContoller.logout);

router.put("/update/:id", candContoller.updateCand);

router.get("/user", candContoller.getCand);

module.exports = router;
