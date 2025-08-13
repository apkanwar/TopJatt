// /pages/api/history.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  try {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const now = new Date();
    const from = new Date(); from.setDate(now.getDate() - 35);
    const rows = await yahooFinance.historical(symbol, {
      period1: from, period2: now, interval: '1d'
    });

    const closes = rows
      .filter(r => r.close != null)
      .slice(-30)
      .map(r => Number(r.close));

    res.status(200).json({ closes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'History fetch failed' });
  }
}