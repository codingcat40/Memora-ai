const mongoose = require("mongoose");

const conversationMessageSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    model: { type: String, required: true },
    selectedRole: { type: String, required: true },
  },
  { timestamps: true },
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: [conversationMessageSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Conversation", conversationSchema);
