const mongoose = require("mongoose");

// `content` is a denormalized snapshot of the relevant text (the liked/
// retweeted post's content, or the reply's own text) captured at creation
// time. That's a deliberate scalability + correctness choice: rendering a
// notification list never has to join back to Post (which may since have
// been edited or deleted), it just reads the snapshot straight off the
// notification document.
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "retweet", "follow", "reply"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    content: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user's notification feed, newest first.
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Fast unread-count / mark-all-read.
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
