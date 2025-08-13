import { useState } from 'react';

export default function AdminTrades() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selected, setSelected] = useState(null); // { symbol, name, sparkline? }
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const onSearch = async () => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setSelected(null);
    setMessage('');
    try {
      const res = await fetch(`/api/search-symbol?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMessage('Search failed');
    } finally {
      setLoadingSearch(false);
    }
  };

  const selectItem = async (item) => {
    setSelected({ ...item, sparkline: [] });
    setMessage('');
    // fetch tiny history and attach to selection
    try {
      const res = await fetch(`/api/history?symbol=${encodeURIComponent(item.symbol)}`);
      const data = await res.json();
      setSelected(prev => ({ ...prev, sparkline: Array.isArray(data?.closes) ? data.closes : [] }));
    } catch (e) {
      // still allow saving even if history fails
      console.warn('Sparkline fetch failed', e);
    }
  };

  const saveTrade = async () => {
    if (!selected || !buyPrice || !sellPrice) {
      setMessage('Please select a symbol and enter both prices.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selected.symbol,
          name: selected.name,
          buyPrice,
          sellPrice,
          sparkline: selected.sparkline || [],
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('✅ Trade saved!');
      setBuyPrice(''); setSellPrice('');
    } catch (e) {
      console.error(e);
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h2>Add Trade</h2>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Search stock/crypto/futures (e.g. AAPL, BTC-USD, CL=F)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={onSearch} disabled={loadingSearch}>
          {loadingSearch ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results list (limit visible height ≈ 3 rows; scroll for rest) */}
      {results.length > 0 && (
        <div
          style={{
            marginTop: 16,
            border: '1px solid #eee',
            borderRadius: 8,
            maxHeight: 168,           // ~3 items tall (adjust as you like)
            overflowY: 'auto'
          }}
        >
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => selectItem(r)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                border: 'none',
                borderBottom: '1px solid #f0f0f0',
                background: selected?.symbol === r.symbol ? '#f3f4f6' : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 600 }}>{r.symbol}</div>
              <div style={{ fontSize: 12, color: '#555' }}>
                {r.name} {r.type ? `• ${r.type}` : ''} {r.exchange ? `• ${r.exchange}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* After selection, show buy/sell inputs + save */}
      {selected && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Selected:</strong> {selected.symbol} — {selected.name}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number" step="0.01" placeholder="Buy price"
              value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
              style={{ padding: 8, width: 160 }}
            />
            <input
              type="number" step="0.01" placeholder="Sell price"
              value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
              style={{ padding: 8, width: 160 }}
            />
            <button onClick={saveTrade} disabled={saving}>
              {saving ? 'Saving...' : 'Save Trade'}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
            Sparkline points: {selected?.sparkline?.length || 0}
          </div>
        </div>
      )}

      {!!message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}