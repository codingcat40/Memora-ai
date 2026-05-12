const express = require("express");
const {
  createUser,
  login,
  logout,
  getUserData,
} = require("../controllers/authController.js");
const auth = require("../middlewares/auth.js");

const router = express.Router();

router.post("/createuser", createUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, getUserData);

module.exports = router;
