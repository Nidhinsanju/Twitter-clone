const mongoose = require("mongoose");

// One document per DM thread between two users. `participantsKey` is the
// two participant ids sorted and joined ("<idA>_<idB>") so a unique index
// can stop duplicate conversations for the same pair from ever being
// created, without needing a transaction or an $all/$size query.
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    participantsKey: { type: String, required: true, unique: true },

    // Denormalized preview so the conversation list can render without
    // fetching the last message from the (potentially huge) messages
    // collection for every conversation row.
    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

function keyFor(userIdA, userIdB) {
  return [userIdA.toString(), userIdB.toString()].sort().join("_");
}

conversationSchema.statics.findOrCreateBetween = async function (userIdA, userIdB) {
  const participantsKey = keyFor(userIdA, userIdB);
  const existing = await this.findOne({ participantsKey });
  if (existing) return existing;
  try {
    return await this.create({ participants: [userIdA, userIdB], participantsKey });
  } catch (err) {
    // Two concurrent requests raced to create the same conversation; the
    // unique index rejected the loser, so just return the winner's doc.
    if (err.code === 11000) return this.findOne({ participantsKey });
    throw err;
  }
};

module.exports = mongoose.model("Conversation", conversationSchema);
