const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";
const EXPIRES_IN = "7d";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Frontend (Vercel) and backend (Render) live on different domains, so the
// auth cookie must be sent cross-site. That requires SameSite=None, which in
// turn requires Secure (browsers reject SameSite=None cookies without it).
// Locally both run on http://localhost, so we keep Lax/non-secure there —
// SameSite=None cookies are dropped over plain http.
//
// We key this off req.secure (real HTTPS, respecting the "trust proxy"
// setting) rather than NODE_ENV, since NODE_ENV isn't guaranteed to be set
// to "production" by the host.
function cookieOptions(req) {
  const isHttps = req.secure;
  return {
    httpOnly: true,
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
  };
}

function setAuthCookie(res, req, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(req), maxAge: MAX_AGE_MS });
}

function clearAuthCookie(res, req) {
  res.clearCookie(COOKIE_NAME, cookieOptions(req));
}

module.exports = { COOKIE_NAME, signToken, verifyToken, setAuthCookie, clearAuthCookie };
