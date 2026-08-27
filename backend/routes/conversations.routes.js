const express = require("express");
const { body, validationResult } = require("express-validator");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const PARTICIPANT_FIELDS = "name username avatarColor";

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

function isParticipant(conversation, userId) {
  return conversation.participants.some((p) => p.toString() === userId || p._id?.toString() === userId);
}

router.get("/", requireAuth, async (req, res) => {
  const conversations = await Conversation.find({ participants: req.userId })
    .sort({ lastMessageAt: -1 })
    .populate("participants", PARTICIPANT_FIELDS);

  const results = await Promise.all(
    conversations.map(async (c) => {
      const other = c.participants.find((p) => p._id.toString() !== req.userId);
      if (!other) return null; // the other participant's account was deleted

      const hasUnread = await Message.exists({
        conversation: c._id,
        sender: { $ne: req.userId },
        readBy: { $ne: req.userId },
      });

      return {
        id: c._id.toString(),
        user: {
          id: other._id.toString(),
          name: other.name,
          handle: other.username,
          avatarColor: other.avatarColor,
        },
        lastMessage: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
        unread: Boolean(hasUnread),
      };
    })
  );

  res.json({ conversations: results.filter(Boolean) });
});

// Finds (or starts) the 1:1 conversation with `:username`, so the frontend
// can jump straight into a thread from a profile or a "who to message" list.
router.post("/with/:username", requireAuth, async (req, res) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target._id.toString() === req.userId) {
    return res.status(400).json({ error: "You can't message yourself" });
  }

  const conversation = await Conversation.findOrCreateBetween(req.userId, target._id);
  res.json({
    conversation: {
      id: conversation._id.toString(),
      user: {
        id: target._id.toString(),
        name: target.name,
        handle: target.username,
        avatarColor: target.avatarColor,
      },
      lastMessage: conversation.lastMessageText,
      lastMessageAt: conversation.lastMessageAt,
      unread: false,
    },
  });
});

router.get("/:id/messages", requireAuth, async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !isParticipant(conversation, req.userId)) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
  // Opening the thread marks the other side's messages read.
  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.userId }, readBy: { $ne: req.userId } },
    { $addToSet: { readBy: req.userId } }
  );

  res.json({
    messages: messages.map((m) => ({
      id: m._id.toString(),
      text: m.text,
      senderId: m.sender.toString(),
      createdAt: m.createdAt,
    })),
  });
});

router.post(
  "/:id/messages",
  requireAuth,
  [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Message can't be empty")
      .isLength({ max: 1000 })
      .withMessage("Message is too long"),
  ],
  handleValidation,
  async (req, res) => {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !isParticipant(conversation, req.userId)) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.userId,
      text: req.body.text,
      readBy: [req.userId],
    });

    conversation.lastMessageText = message.text;
    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessageSender = req.userId;
    await conversation.save();

    res.status(201).json({
      message: {
        id: message._id.toString(),
        text: message.text,
        senderId: req.userId,
        createdAt: message.createdAt,
      },
    });
  }
);

module.exports = router;
