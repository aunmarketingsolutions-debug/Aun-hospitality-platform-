const { prisma } = require('../../../lib/prisma');
const { getSession } = require('../../../lib/auth');

function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

module.exports = async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not signed in' });

  if (req.method === 'GET') {
    if (session.role === 'aun') {
      const properties = await prisma.property.findMany({
        include: { couponTemplates: true, homeCards: true, redemptions: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ properties });
    }
    if (session.role === 'hotel') {
      const property = await prisma.property.findUnique({
        where: { id: session.propertyId },
        include: { couponTemplates: true },
      });
      return res.json({ properties: property ? [property] : [] });
    }
    if (session.role === 'customer') {
      const card = await prisma.card.findUnique({
        where: { id: session.cardId },
        include: { coupons: true },
      });
      const propIds = [...new Set((card?.coupons || []).map((c) => c.propertyId))];
      const properties = await prisma.property.findMany({ where: { id: { in: propIds } } });
      return res.json({ properties });
    }
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'POST') {
    if (session.role !== 'aun') return res.status(403).json({ error: 'Forbidden — AUN admin only' });
    const { name, location, phone, cardPrice, couponTemplates } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const existing = await prisma.property.findUnique({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'A hotel with this phone is already onboarded' });

    const pin = genPin();
    const property = await prisma.property.create({
      data: {
        name,
        location: location || '—',
        phone,
        pin,
        cardPrice: cardPrice || 2999,
        couponTemplates: {
          create: (couponTemplates || []).map((t) => ({
            name: t.name,
            icon: t.icon,
            maxUses: t.maxUses,
            valueType: t.valueType || 'simple',
            worthAmount: t.valueType === 'worth' ? t.worthAmount : null,
            minBilling: t.valueType === 'minbill' ? t.minBilling : null,
            discountAmount: t.valueType === 'minbill' ? t.discountAmount : null,
            rules: t.rules || null,
          })),
        },
      },
      include: { couponTemplates: true },
    });
    return res.json({ property, pin });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
