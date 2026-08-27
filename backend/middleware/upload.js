const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Never trust the client-supplied filename/extension — derive it from
    // the sniffed mimetype instead, and generate the name ourselves.
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype] || "";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
    return cb(new Error("Only JPEG, PNG, WEBP or GIF images are allowed"));
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE_BYTES } });

// Wraps multer's single-file middleware so upload errors (wrong type, too
// big) come back as the same { error: "..." } JSON shape as every other
// validation failure in this API, instead of an uncaught exception.
function uploadImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image must be smaller than 5MB" });
    }
    return res.status(400).json({ error: err.message || "Couldn't upload image" });
  });
}

function deleteUploadedFile(imageUrl) {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  fs.unlink(path.join(UPLOAD_DIR, filename), (err) => {
    if (err && err.code !== "ENOENT") console.error("Failed to delete upload:", err);
  });
}

module.exports = { uploadImage, deleteUploadedFile, UPLOAD_DIR };
