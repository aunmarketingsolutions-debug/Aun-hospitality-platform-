const { serialize } = require('cookie');
const { COOKIE_NAME } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
  );
  res.json({ ok: true });
};
