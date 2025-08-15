// src/pages/api/achievements/index.js
// GET (list) + POST (create)
// DB: my_app, Collection: achievements

import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('my_app');
    const col = db.collection('achievements');

    // --- GET: list achievements (search by title only) ---
    if (req.method === 'GET') {
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
      const q = (req.query.q || '').trim();

      const filter = {};
      if (q) filter.title = { $regex: q, $options: 'i' };

      const total = await col.countDocuments(filter);
      const items = await col
        .find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

      return res.status(200).json({ items, total, page, pageSize });
    }

    // --- POST: create an achievement ---
    if (req.method === 'POST') {
      const { title, description = '', logo = null, userId = null } = req.body || {};
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'title is required' });
      }

      const now = new Date();
      const doc = {
        title: String(title).trim(),
        description: String(description || '').trim(),
        logo: logo ? String(logo).trim() : null,
        createdAt: now,
        lastModified: now,
      };

      const result = await col.insertOne(doc);
      return res.status(200).json({ ok: true, id: result.insertedId });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('GET/POST /api/achievements error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}