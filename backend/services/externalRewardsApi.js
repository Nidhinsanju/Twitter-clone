// Stub for the not-yet-chosen external rewards/points API. Nothing calls
// out yet — this just defines the shape rewards.service.js talks to, so
// wiring up the real provider later is a change confined to this one file.
//
// TODO(rewards-api): once a provider is picked, set REWARDS_API_URL and
// REWARDS_API_KEY in the environment and implement the call below. Until
// then this is a no-op so the internal points ledger works standalone.
async function sendReward({ userId, type, points, sourceId }) {
  if (!process.env.REWARDS_API_URL) {
    return { skipped: true };
  }

  // Expected shape of the real integration:
  // const res = await fetch(`${process.env.REWARDS_API_URL}/credit`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env.REWARDS_API_KEY}`,
  //   },
  //   body: JSON.stringify({ userId, type, points, sourceId }),
  // });
  // if (!res.ok) throw new Error(`Rewards API responded ${res.status}`);
  // const data = await res.json();
  // return { skipped: false, id: data.transactionId };

  return { skipped: true };
}

module.exports = { sendReward };
