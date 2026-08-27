const Notification = require("../models/Notification");

// Fire-and-forget notification creation: never let a notification failure
// break the action that triggered it (a like/follow/reply should still
// succeed even if this insert has a problem). Skips self-notifications
// (liking/replying to your own post, following yourself).
async function notify({ recipientId, actorId, type, postId = null, content = "" }) {
  if (!recipientId || recipientId.toString() === actorId.toString()) return;
  try {
    await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      post: postId,
      content: content.slice(0, 280),
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

module.exports = { notify };
