// src/pages/api/achievements/[id].js
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  let _id;
  try {
    _id = new ObjectId(String(id));
  } catch {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('my_app');
    const col = db.collection('achievements');

    if (req.method === 'PUT') {
      const { title, description, logo } = req.body || {};
      const $set = { lastModified: new Date() };

      if (typeof title === 'string') $set.title = title.trim();
      if (typeof description === 'string') $set.description = description.trim();
      if (logo === null) $set.logo = null; // explicit null
      if (typeof logo === 'string') $set.logo = logo.trim();

      if (Object.keys($set).length === 1) {
        return res.status(400).json({ error: 'no fields to update' });
      }

      const result = await col.updateOne({ _id }, { $set });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'not found' });
      return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const result = await col.deleteOne({ _id });
      return res.status(200).json({ ok: true, deletedCount: result.deletedCount || 0 });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('PUT/DELETE /api/achievements/[id] error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}