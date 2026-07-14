const { serialize } = require('cookie');
const { prisma } = require('../../../lib/prisma');
const { signToken, COOKIE_NAME } = require('../../../lib/auth');

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { role, phone, pin, password } = req.body || {};

  if (role === 'aun') {
    if (!process.env.AUN_ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Server not configured — AUN_ADMIN_PASSWORD missing' });
    }
    if (password !== process.env.AUN_ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const token = signToken({ role: 'aun' });
    setSessionCookie(res, token);
    return res.json({ ok: true, role: 'aun' });
  }

  if (role === 'hotel') {
    if (!phone || !pin) return res.status(400).json({ error: 'Phone and PIN required' });
    const property = await prisma.property.findFirst({ where: { phone, pin } });
    if (!property) return res.status(401).json({ error: 'Phone or PIN not recognized' });
    const token = signToken({ role: 'hotel', propertyId: property.id });
    setSessionCookie(res, token);
    return res.json({ ok: true, role: 'hotel', property });
  }

  if (role === 'customer') {
    if (!phone) return res.status(400).json({ error: 'Phone number requir
