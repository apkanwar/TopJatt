// pages/api/trades/index.js
import clientPromise from '../../../lib/mongodb';
import yahooFinance from 'yahoo-finance2';

async function fetchSparkline(symbol) {
  const now = new Date();
  const from = new Date(); from.setDate(now.getDate() - 35);
  const rows = await yahooFinance.historical(symbol, { period1: from, period2: now, interval: '1d' });
  return rows.filter(r => r.close != null).slice(-30).map(r => Number(r.close));
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('my_app');
  const collection = db.collection('trades');

  if (req.method === 'GET') {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
    const skip = (page - 1) * pageSize;

    // NEW: unified search
    const q = (req.query.q || '').trim();           // search name OR symbol
    const legacyName = (req.query.name || '').trim(); // backward-compat
    const status = (req.query.status || '').trim(); // '', 'open', 'closed'

    const and = [];
    if (q) {
      and.push({ $or: [
        { name:   { $regex: q, $options: 'i' } },
        { symbol: { $regex: q, $options: 'i' } },
      ]});
    } else if (legacyName) {
      and.push({ name: { $regex: legacyName, $options: 'i' } });
    }
    if (status === 'open')   and.push({ soldAt: { $in: [null, undefined] } });
    if (status === 'closed') and.push({ soldAt: { $ne: null } });

    const filter = and.length ? { $and: and } : {};

    const [items, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).toArray(),
      collection.countDocuments(filter),
    ]);

    return res.status(200).json({ items, total, page, pageSize, q: q || legacyName, status });
  }

  if (req.method === 'POST') {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const docs = [];
    for (const t of payload) {
      const { symbol, name, buyPrice, sellPrice, shares, boughtAt, soldAt } = t || {};
      if (!symbol || buyPrice == null || shares == null) {
        return res.status(400).json({ error: 'symbol, buyPrice, shares are required' });
      }
      const hasSoldDate  = !!soldAt;
      const hasSellPrice = sellPrice != null && sellPrice !== '';
      if (hasSoldDate !== hasSellPrice) {
        return res.status(400).json({ error: 'soldAt and sellPrice must be provided together or both omitted' });
      }
      const sparkline = await fetchSparkline(symbol).catch(() => []);
      docs.push({
        symbol,
        name: name || symbol,
        buyPrice: Number(buyPrice),
        sellPrice: hasSellPrice ? Number(sellPrice) : null,
        shares: Number(shares),
        boughtAt: boughtAt ? new Date(boughtAt) : null,
        soldAt:   hasSoldDate ? new Date(soldAt)   : null,
        sparkline,
        createdAt: new Date(),
        lastModified: new Date(),
      });
    }
    if (docs.length === 1) {
      const r = await collection.insertOne(docs[0]);
      return res.status(201).json({ _id: r.insertedId, ...docs[0] });
    } else {
      const r = await collection.insertMany(docs);
      return res.status(201).json({ insertedCount: r.insertedCount, ids: Object.values(r.insertedIds) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}