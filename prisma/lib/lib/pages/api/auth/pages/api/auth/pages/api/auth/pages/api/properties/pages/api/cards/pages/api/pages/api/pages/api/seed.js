// Visit /api/seed?key=YOUR_AUN_ADMIN_PASSWORD once after your first deploy to
// populate demo hotels + a demo member, so you can see the platform working
// end-to-end before onboarding real hotels. Safe to call more than once —
// it skips if data already exists.
const { prisma } = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (!process.env.AUN_ADMIN_PASSWORD || req.query.key !== process.env.AUN_ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Forbidden — pass ?key=YOUR_ADMIN_PASSWORD' });
  }

  const existing = await prisma.property.count();
  if (existing > 0) {
    return res.json({ message: 'Already seeded — skipping. Delete data manually if you want to reseed.' });
  }

  const p1 = await prisma.property.create({
    data: {
      name: 'Coconut Lagoon Agro Resort', location: 'Parbhani', cardPrice: 3499,
      phone: '9970000001', pin: '1234',
      couponTemplates: { create: [
        { name: 'Complimentary Breakfast', icon: '🍳', maxUses: 4, valueType: 'simple', rules: 'Valid for one time till expiry date. Subject to availability.' },
        { name: 'BOGO Dinner Buffet', icon: '🍽️', maxUses: 2, valueType: 'simple', rules: 'Dine with minimum two people, pay for one and enjoy another free.' },
        { name: 'Cash Coupon — Food Free', icon: '🎁', maxUses: 6, valueType: 'worth', worthAmount: 300, rules: 'Not valid in parcel. One coupon redeemable per day per table.' },
        { name: 'Spa Treatment', icon: '💆', maxUses: 1, valueType: 'simple', rules: '60 minutes session. Book in advance.' },
      ]},
    },
  });
  const p2 = await prisma.property.create({
    data: {
      name: 'Rukmani Thrillax', location: 'Washim', cardPrice: 1999,
      phone: '9970000002', pin: '2345',
      couponTemplates: { create: [
        { name: 'Free Waterpark Entry', icon: '💦', maxUses: 2, valueType: 'simple', rules: 'Subject to park operating hours and availability.' },
        { name: 'Gift Certificate — Bill Discount', icon: '🎁', maxUses: 1, valueType: 'minbill', minBilling: 1000, discountAmount: 300, rules: 'Cannot be clubbed with any other offer.' },
      ]},
    },
  });
  const p3 = await prisma.property.create({
    data: {
      name: 'Krishna Inn', location: 'Kolhapur', cardPrice: 2499,
      phone: '9970000003', pin: '3456',
      couponTemplates: { create: [
        { name: '50% Off Room', icon: '🛏️', maxUses: 2, valueType: 'simple', rules: 'Valid on rack rate, subject to availability.' },
        { name: 'Complimentary Breakfast', icon: '🍳', maxUses: 2, valueType: 'simple', rules: 'Valid for one time till expiry date.' },
      ]},
    },
  });

  const p1Templates = await prisma.couponTemplate.findMany({ where: { propertyId: p1.id } });
  const p2Templates = await prisma.couponTemplate.findMany({ where: { propertyId: p2.id } });
  const p3Templates = await prisma.couponTemplate.findMany({ where: { propertyId: p3.id } });

  const validTill = new Date();
  validTill.setFullYear(validTill.getFullYear() + 1);

  await prisma.card.create({
    data: {
      holder: 'Priya Deshmukh', phone: '9822000000', tier: 'Gold', number: 'AUN 1290 4830 7737',
      homePropertyId: p1.id, price: 3499, validTill,
      coupons: {
        create: [
          ...p1Templates.map((t) => ({ propertyId: p1.id, name: t.name, icon: t.icon, maxUses: t.maxUses, valueType: t.valueType, worthAmount: t.worthAmount, minBilling: t.minBilling, discountAmount: t.discountAmount, rules: t.rules })),
          ...p2Templates.map((t) => ({ propertyId: p2.id, name: t.name, icon: t.icon, maxUses: t.maxUses, valueType: t.valueType, worthAmount: t.worthAmount, minBilling: t.minBilling, discountAmount: t.discountAmount, rules: t.rules })),
          ...p3Templates.map((t) => ({ propertyId: p3.id, name: t.name, icon: t.icon, maxUses: t.maxUses, valueType: t.valueType, worthAmount: t.worthAmount, minBilling: t.minBilling, discountAmount: t.discountAmount, rules: t.rules })),
        ],
      },
    },
  });

  res.json({
    ok: true,
    message: 'Seeded 3 demo hotels and 1 demo member.',
    demoLogins: {
      hotel1: { phone: '9970000001', pin: '1234' },
      hotel2: { phone: '9970000002', pin: '2345' },
      hotel3: { phone: '9970000003', pin: '3456' },
      member: { phone: '9822000000' },
    },
  });
};
