const { PROFILE_FIELDS } = require("../config/rewards");

// Returns how complete a profile is (0-100, rounded) plus the still-missing
// optional fields, so a single call can drive both a progress ring and a
// "here's what's left" checklist on the frontend. Computed on the fly from
// the live document rather than stored/cached, so it's never stale.
function computeProfileCompletion(user) {
  const missing = [];
  let filledCount = 0;
  for (const field of PROFILE_FIELDS) {
    if (field.isFilled(user)) {
      filledCount += 1;
    } else if (field.label) {
      missing.push({ key: field.key, label: field.label });
    }
  }
  const percent = Math.round((filledCount / PROFILE_FIELDS.length) * 100);
  return { percent, missing };
}

module.exports = { computeProfileCompletion };
