const { prisma } = require('../../lib/prisma');
const { getSession } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not signed in' });

  const where = session.role === 'hotel' ? { propertyId: session.propertyId } : {};
  const redemptions = await prisma.redemption.findMany({
    where,
    orderBy: { at: 'desc' },
    take: 100,
  });
  res.json({ redemptions });
};
