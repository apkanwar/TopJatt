import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const results = await yahooFinance.search(query);
    const items = (results?.quotes || [])
      // remove empties / junk rows
      .filter(q => q?.symbol && (q?.shortname || q?.longname))
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType,
        exchange: q.exchange,
      }));

    res.status(200).json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
}