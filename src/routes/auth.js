const express = require("express");
const router = express.Router();
const { loginAdmin, registerAdmin } = require("../controller/authController");

router.post("/login", loginAdmin);
router.post("/register-admin", registerAdmin);

module.exports = router;
