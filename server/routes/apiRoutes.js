const express = require("express");

const auth = require("../middlewares/auth.js");

const { getMyData, deleteQuery } = require("../controllers/homeController.js");
const conversationController = require("../controllers/conversationController.js");

const router = express.Router();

router.post("/prompt", auth, conversationController.sendPrompt);
router.get("/conversations", auth, conversationController.listConversations);
router.post("/conversations", auth, conversationController.createConversation);
router.delete(
  "/conversations/:conversationId/messages/:messageId",
  auth,
  conversationController.deleteMessage,
);

router.get("/history", auth, getMyData);
router.delete("/history/:id", auth, deleteQuery);

module.exports = router;
