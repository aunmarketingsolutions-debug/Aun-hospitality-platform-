const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const COOKIE_NAME = 'aun_session';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

// Parses the session cookie from a Next.js API request (pages router).
function getSession(req) {
  const token = req.cookies ? req.cookies[COOKIE_NAME] : null;
  if (!token) return null;
  return verifyToken(token);
}

module.exports = { signToken, verifyToken, getSession, COOKIE_NAME, SECRET };
