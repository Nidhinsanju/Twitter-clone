const { COOKIE_NAME, verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

// Attaches req.userId if a valid token is present, but does not block the request.
function attachUser(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.sub;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

module.exports = { requireAuth, attachUser };
