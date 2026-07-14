const { prisma } = require('../../../lib/prisma');
const { getSession } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.json({ session: null });

  if (session.role === 'hotel') {
    const property = await prisma.property.findUnique({
      where: { id: session.propertyId },
      include: { couponTemplates: true },
    });
    if (!property) return res.json({ session: null });
    return res.json({ session, property });
  }

  if (session.role === 'customer') {
    const card = await prisma.card.findUnique({
      where: { id: session.cardId },
      include: { coupons: true, homeProperty: true },
    });
    if (!card) return res.json({ session: null });
    return res.json({ session, card });
  }

  return res.json({ session });
};
