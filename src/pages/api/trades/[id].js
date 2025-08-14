import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

  const client = await clientPromise;
  const db = client.db('my_app');
  const collection = db.collection('trades');
  const _id = new ObjectId(id);

  if (req.method === 'PUT') {
    const { buyPrice, sellPrice, shares, boughtAt, soldAt } = req.body || {};
    if (buyPrice == null || shares == null) {
      return res.status(400).json({ error: 'buyPrice and shares are required' });
    }

    const existing = await collection.findOne({ _id });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // both-or-none rule
    const hasSoldDate  = !!soldAt;
    const hasSellPrice = sellPrice != null && sellPrice !== '';
    if (hasSoldDate !== hasSellPrice) {
      return res.status(400).json({ error: 'soldAt and sellPrice must be provided together or both omitted' });
    }

    const update = {
      buyPrice: Number(buyPrice),
      shares: Number(shares),
      boughtAt: boughtAt ? new Date(boughtAt) : null,
      lastModified: new Date(),
    };
    if (hasSoldDate) {
      update.soldAt   = new Date(soldAt);
      update.sellPrice = Number(sellPrice);
    } else {
      update.soldAt = null;
      update.sellPrice = null;
    }

    const result = await collection.updateOne({ _id }, { $set: update });
    return res.status(200).json({ ok: result.modifiedCount === 1 });
  }

  if (req.method === 'DELETE') {
    const r = await collection.deleteOne({ _id });
    return res.status(200).json({ ok: r.deletedCount === 1 });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}