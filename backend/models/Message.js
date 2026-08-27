const mongoose = require("mongoose");

// Messages live in their own collection keyed by conversation, rather than
// as an embedded array on Conversation — an active DM thread can run to
// thousands of messages, which would otherwise hit the same unbounded-array
// problem as the old embedded replies/likes.
const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 1000 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// A conversation's thread, oldest first, paginated.
messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
