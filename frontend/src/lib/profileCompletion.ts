// Mirrors backend/config/rewards.js's PROFILE_FIELDS + computeProfileCompletion.
// Used only for instant client-side feedback while the user is still typing
// or picking photos (before a save round-trip) — the backend's computed
// value on the saved User is always the source of truth once a save happens.
const TEXT_FIELDS: { key: string; label: string; isFilled: (v: string) => boolean }[] = [
  { key: "bio", label: "Add a bio", isFilled: (v) => v.trim().length > 0 },
  { key: "location", label: "Add your location", isFilled: (v) => v.trim().length > 0 },
  { key: "website", label: "Add your website", isFilled: (v) => v.trim().length > 0 },
];

// name/username/avatarColor/banner are always filled by the time this runs
// (required at signup, or defaulted) — they contribute a fixed baseline so
// the percentage matches what the backend reports for the same fields.
const ALWAYS_FILLED_COUNT = 4;
const PHOTO_FIELD_COUNT = 2; // avatarUrl + bannerUrl
const TOTAL_FIELDS = ALWAYS_FILLED_COUNT + TEXT_FIELDS.length + PHOTO_FIELD_COUNT;

export function computeLiveProfileCompletion(fields: {
  bio: string;
  location: string;
  website: string;
  hasAvatarPhoto: boolean;
  hasBannerPhoto: boolean;
}) {
  const missing: { key: string; label: string }[] = [];
  let filledCount = ALWAYS_FILLED_COUNT;

  for (const field of TEXT_FIELDS) {
    if (field.isFilled(fields[field.key as keyof typeof fields] as string)) {
      filledCount += 1;
    } else {
      missing.push({ key: field.key, label: field.label });
    }
  }

  if (fields.hasAvatarPhoto) filledCount += 1;
  else missing.push({ key: "avatarUrl", label: "Upload a profile picture" });

  if (fields.hasBannerPhoto) filledCount += 1;
  else missing.push({ key: "bannerUrl", label: "Upload a banner image" });

  return { percent: Math.round((filledCount / TOTAL_FIELDS) * 100), missing };
}
