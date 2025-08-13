import clientPromise from '../../lib/mongodb'; // your mongodb.js default export

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('my_app');            // ← your DB
    const collection = db.collection('trades'); // ← your collection

    if (req.method === 'GET') {
      const trades = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(trades);
    }

    if (req.method === 'POST') {
      const { symbol, name, buyPrice, sellPrice, sparkline } = req.body;
      if (!symbol || buyPrice == null || sellPrice == null) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const doc = {
        symbol,
        name,
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        sparkline: Array.isArray(sparkline) ? sparkline : [],
        createdAt: new Date(),
      };
      const result = await collection.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId, ...doc });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
