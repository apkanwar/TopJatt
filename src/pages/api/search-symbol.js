// npm i yahoo-finance2
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const results = await yahooFinance.search(query);
    // Return only useful fields
    const items = (results?.quotes || []).map(q => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: q.quoteType,        // EQUITY, ETF, CRYPTOCURRENCY, FUTURE, etc.
      exchange: q.exchange,
    }));
    res.status(200).json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
}
