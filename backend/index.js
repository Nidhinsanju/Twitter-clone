require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const { UPLOAD_DIR } = require("./middleware/upload");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const tweetRoutes = require("./routes/tweets.routes");
const notificationRoutes = require("./routes/notifications.routes");
const conversationRoutes = require("./routes/conversations.routes");

const app = express();
const PORT = process.env.PORT || 5000;

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://twitter-clone-nine-woad.vercel.app",
];
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : DEFAULT_ALLOWED_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);

// Fallback error handler so unexpected errors return JSON, not an HTML stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Something went wrong" });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
