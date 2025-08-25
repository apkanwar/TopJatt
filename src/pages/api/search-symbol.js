import yahooFinance from 'yahoo-finance2';

function mapYahooToTvSymbol(q) {
  if (!q) return null;
  const s = String(q).trim().toUpperCase();

  // Crypto like BTC-USD -> prefer BINANCE:BTCUSDT (widget-friendly)
  if (/^[A-Z]+-USD$/.test(s)) {
    const base = s.replace('-USD', '');
    return `BINANCE:${base}USDT`;
  }

  // Futures ES=F, NQ=F, CL=F, GC=F, etc. -> continuous front-month on TV
  const futMap = {
    'ES=F': 'CME_MINI:ES1!',
    'NQ=F': 'CME_MINI:NQ1!',
    'YM=F': 'CBOT_MINI:YM1!',
    'RTY=F': 'CME_MINI:RTY1!',
    'CL=F': 'NYMEX:CL1!',
    'NG=F': 'NYMEX:NG1!',
    'GC=F': 'COMEX:GC1!',
    'SI=F': 'COMEX:SI1!',
    'HG=F': 'COMEX:HG1!',
    'ZB=F': 'CBOT:ZB1!',
    'ZN=F': 'CBOT:ZN1!',
    'ZF=F': 'CBOT:ZF1!',
    'ZS=F': 'CBOT:ZS1!',
    'ZC=F': 'CBOT:ZC1!',
    'ZW=F': 'CBOT:ZW1!',
  };
  if (futMap[s]) return futMap[s];

  // Toronto symbols end with .TO in Yahoo -> TV uses TSX:SYM
  if (s.endsWith('.TO')) return `TSX:${s.replace('.TO','')}`;
  // London .L -> LSE:SYM
  if (s.endsWith('.L')) return `LSE:${s.replace('.L','')}`;
  // Frankfurt .F -> XETR:SYM (heuristic)
  if (s.endsWith('.F')) return `XETR:${s.replace('.F','')}`;

  // If it already looks prefixed, pass through (e.g., NASDAQ:AAPL)
  if (s.includes(':')) return s;

  // Default to NASDAQ for plain US equities; callers can adjust later if needed
  return `NASDAQ:${s}`;
}

function normalizeYahooQuote(q) {
  // yahoo-finance2 search result shape includes fields like: symbol, shortname, longname, exchDisp, quoteType
  const symbol = q?.symbol;
  const name = q?.shortname || q?.longname || symbol || '';
  const exch = (q?.exchDisp || q?.exchange || '').toString();
  const type = (q?.quoteType || q?.typeDisp || '').toString().toLowerCase();

  const tvSymbol = mapYahooToTvSymbol(symbol);
  return tvSymbol ? { symbol: tvSymbol, name, type } : null;
}

export default async function handler(req, res) {
  const q = (req.query.query || '').trim();
  if (!q) return res.status(200).json([]);

  try {
    // Restrict search to NASDAQ, TSX, and crypto using the 'exchanges' and 'lang' parameters if supported.
    // yahoo-finance2 does not have a direct 'exchanges' param for search, so we filter after retrieval.
    const data = await yahooFinance.search(q, { quotesCount: 20, newsCount: 0 });
    const quotes = Array.isArray(data?.quotes) ? data.quotes : [];

    // Filter for NASDAQ US equities, TSX (.TO) Canadian equities, and crypto (-USD)
    const filtered = quotes.filter(q => {
      if (!q?.symbol) return false;
      const symbol = q.symbol.toUpperCase();
      const exch = (q?.exchDisp || q?.exchange || '').toUpperCase();
      const type = (q?.quoteType || q?.typeDisp || '').toLowerCase();
      // US NASDAQ-listed equities
      if (
        exch === 'NASDAQ' &&
        (type === 'equity' || type === 'common stock' || type === 'etf')
      ) {
        return true;
      }
      // Canadian TSX equities (symbols ending in .TO)
      if (
        symbol.endsWith('.TO') &&
        (type === 'equity' || type === 'common stock' || type === 'etf')
      ) {
        return true;
      }
      // Crypto symbols ending in -USD
      if (
        symbol.endsWith('-USD') &&
        type === 'cryptocurrency'
      ) {
        return true;
      }
      return false;
    });

    const mapped = filtered
      .map(normalizeYahooQuote)
      .filter(Boolean)
      // De-duplicate by symbol
      .filter((item, idx, arr) => arr.findIndex(x => x.symbol === item.symbol) === idx)
      .slice(0, 20);

    return res.status(200).json(mapped);
  } catch (e) {
    console.error('Yahoo search error', e);
    return res.status(200).json([]);
  }
}