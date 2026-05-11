const Conversation = require("../models/ConversationModel.js");
const GeminiModel = require("../models/GeminiModel.js");
const { enhancedChat } = require("../service/enhancePrompt.js");

/**
 * One-time import of flat GeminiModel rows into a single Conversation per user,
 * then removes legacy rows so migration does not run twice.
 */
async function migrateLegacyIfNeeded(userId) {
  const count = await Conversation.countDocuments({ user: userId });
  if (count > 0) return;

  const legacy = await GeminiModel.find({ user: userId })
    .sort({ createdAt: 1 })
    .lean();
  if (!legacy.length) return;

  await Conversation.create({
    user: userId,
    messages: legacy.map((d) => ({
      prompt: d.prompt,
      response: d.response,
      model: d.model,
      selectedRole: d.selectedRole || "assistant",
    })),
  });

  await GeminiModel.deleteMany({ user: userId });
}

function formatConversation(doc) {
  const messages = (doc.messages || []).map((m) => ({
    _id: String(m._id),
    prompt: m.prompt,
    response: m.response,
  }));
  return {
    id: String(doc._id),
    messages,
  };
}

module.exports.listConversations = async (req, res) => {
  try {
    const userId = req.userId;
    await migrateLegacyIfNeeded(userId);

    const docs = await Conversation.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    const data = docs.map((d) => formatConversation(d));
    res.status(200).json({ message: "ok", data });
  } catch (error) {
    console.error("listConversations", error);
    res.status(500).json({ message: "Error listing conversations" });
  }
};

module.exports.createConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const doc = await Conversation.create({ user: userId, messages: [] });
    res.status(201).json({
      message: "Created",
      data: formatConversation(doc.toObject()),
    });
  } catch (error) {
    console.error("createConversation", error);
    res.status(500).json({ message: "Error creating conversation" });
  }
};

module.exports.sendPrompt = async (req, res) => {
  try {
    const { prompt, model, selectedRole, conversationId } = req.body;

    if (!prompt || !model || !conversationId) {
      return res.status(400).json({
        error: "prompt, model, and conversationId are required",
      });
    }

    const userId = req.userId;
    const conv = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });
    if (!conv) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const responseText = await enhancedChat(
      userId,
      prompt,
      selectedRole,
      model,
    );

    conv.messages.push({
      prompt,
      response: responseText,
      model,
      selectedRole: selectedRole || "user",
    });
    await conv.save();

    const lastMsg = conv.messages[conv.messages.length - 1];
    res.status(201).json({
      message: "Prompt has been sent",
      responseText,
      id: lastMsg._id,
    });
  } catch (err) {
    console.error("sendPrompt", err);
    res.status(500).json({ message: "error creating gemini request!", err });
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.userId;

    const result = await Conversation.updateOne(
      { _id: conversationId, user: userId },
      { $pull: { messages: { _id: messageId } } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("deleteMessage", err);
    res.status(500).json({ message: "Error deleting message" });
  }
};
