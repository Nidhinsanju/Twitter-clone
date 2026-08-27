const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const READY_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// A real health check, not just "the process is running": it also reports
// whether the DB connection is actually up, since a server that's alive but
// can't reach Mongo should fail a readiness probe rather than report ok.
router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = READY_STATES[dbState] || "unknown";
  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: { status: dbStatus },
  });
});

module.exports = router;
