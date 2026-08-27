export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Shared by anything that lets a user pick an image file client-side (post
// images, profile/banner photos) — mirrors the limits the backend actually
// enforces (see backend/middleware/upload.js), so a bad file gets caught
// before the upload round-trip instead of after.
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WEBP or GIF images are allowed";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be smaller than 5MB";
  }
  return null;
}
