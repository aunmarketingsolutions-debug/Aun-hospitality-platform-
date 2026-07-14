const { prisma } = require('../../../lib/prisma');
const { getSession } = require('../../../lib/auth');

function genCardNumber() {
  const seg = () => Math.floor(1000 + Math.random() * 9000);
  return `AUN ${seg()} ${seg()} ${seg()}`;
}

module.exports = async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not signed in' });

  if (req.method === 'GET') {
    if (session.role === 'aun') {
      const cards = await prisma.card.findMany({
        include: { coupons: true, homeProperty: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ cards });
    }
    if (session.role === 'hotel') {
      const cards = await prisma.card.findMany({
        where: { coupons: { some: { propertyId: session.propertyId } } },
        include: { coupons: { where: { propertyId: session.propertyId } } },
      });
      return res.json({ cards });
    }
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'POST') {
    if (session.role !== 'aun') return res.status(403).json({ error: 'Forbidden — AUN admin only' });
    const { name, phone, tier, price, propertyIds } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    if (!propertyIds || !propertyIds.length) return res.status(400).json({ error: 'Select at least one hotel' });

    const existing = await prisma.card.findUnique({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'A member with this phone already exists' });

    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      include: { couponTemplates: true },
    });

    const couponsData = [];
    properties.forEach((p) => {
      const templates = p.couponTemplates.length
        ? p.couponTemplates
        : [{ name: 'Membership Benefit', icon: '🎟️', maxUses: 2, valueType: 'simple' }];
      templates.forEach((t) => {
        couponsData.push({
          propertyId: p.id,
          name: t.name,
          icon: t.icon,
          maxUses: t.maxUses,
          valueType: t.valueType || 'simple',
          worthAmount: t.worthAmount,
          minBilling: t.minBilling,
          discountAmount: t.discountAmount,
          rules: t.rules,
        });
      });
    });

    const validTill = new Date();
    validTill.setFullYear(validTill.getFullYear() + 1);

    const card = await prisma.card.create({
      data: {
        holder: name,
        phone,
        tier: tier || 'Gold',
        number: genCardNumber(),
        homePropertyId: propertyIds[0],
        price: price || 2999,
        validTill,
        coupons: { create: couponsData },
      },
      include: { coupons: true },
    });
    return res.json({ card });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
