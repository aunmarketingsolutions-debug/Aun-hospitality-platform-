const { prisma } = require('../../lib/prisma');
const { getSession } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const session = getSession(req);
  if (!session || session.role !== 'customer') return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { couponId } = req.body || {};
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || coupon.cardId !== session.cardId) {
    return res.status(404).json({ error: 'Coupon not found on your card' });
  }
  if (coupon.used >= coupon.maxUses) {
    return res.status(400).json({ error: 'This coupon has already been fully used' });
  }

  const card = await prisma.card.findUnique({ where: { id: session.cardId } });

  const [updatedCoupon] = await prisma.$transaction([
    prisma.coupon.update({ where: { id: couponId }, data: { used: { increment: 1 } } }),
    prisma.redemption.create({
      data: {
        couponId,
        propertyId: coupon.propertyId,
        customer: card.holder,
        couponName: coupon.name,
      },
    }),
  ]);

  res.json({ coupon: updatedCoupon });
};
