import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { ids } = req.body || {};
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids array required' });
        }

        // Convert to ObjectId, skip invalids
        const objectIds = ids
            .map((id) => {
                try { return new ObjectId(id); } catch { return null; }
            })
            .filter(Boolean);

        if (objectIds.length === 0) {
            return res.status(400).json({ error: 'No valid ids' });
        }

        const client = await clientPromise;
        const db = client.db('my_app');

        const result = await db.collection('trades').deleteMany({ _id: { $in: objectIds } });

        return res.status(200).json({
            ok: true,
            deletedCount: result.deletedCount || 0,
            requested: ids.length,
            processed: objectIds.length,
        });
    } catch (e) {
        console.error('bulk-delete error', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}