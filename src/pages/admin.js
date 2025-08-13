// pages/admin.js
import { useState } from 'react';

const moneyPattern  = /^\d+(\.\d{1,2})?$/;
const sharesPattern = /^\d+(\.\d+)?$/;

export default function AdminAddTrades() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]); // {symbol,name,buyPrice,sellPrice,shares,boughtAt,soldAt}
  const [message, setMessage] = useState('');

  const onSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setMessage('');
    try {
      const res = await fetch(`/api/search-symbol?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setResults(items);
    } catch {
      setMessage('Search failed');
    } finally {
      setSearching(false);
    }
  };
  const onSearchKey = (e) => { if (e.key === 'Enter') onSearch(); };

  const addToCart = (item) => {
    if (cart.find(c => c.symbol === item.symbol)) return;
    setCart(prev => [...prev, { ...item, buyPrice:'', sellPrice:'', shares:'', boughtAt:'', soldAt:'' }]);
  };
  const removeFromCart = (symbol) => setCart(prev => prev.filter(c => c.symbol !== symbol));
  const updateCart = (symbol, field, value) =>
    setCart(prev => prev.map(c => c.symbol === symbol ? { ...c, [field]: value } : c));

  const saveAll = async () => {
    // validate each
    for (const c of cart) {
      if (!moneyPattern.test(String(c.buyPrice))) { setMessage(`Invalid buy price for ${c.symbol}`); return; }
      if (!sharesPattern.test(String(c.shares)) || Number(c.shares) <= 0) { setMessage(`Invalid shares for ${c.symbol}`); return; }
      const hasSoldDate  = !!c.soldAt;
      const hasSellPrice = c.sellPrice !== '' && c.sellPrice != null;
      if (hasSoldDate !== hasSellPrice) { setMessage(`Provide both sold date and sell price for ${c.symbol}, or neither`); return; }
      if (hasSellPrice && !moneyPattern.test(String(c.sellPrice))) { setMessage(`Invalid sell price for ${c.symbol}`); return; }
    }
    setMessage('');
    const payload = cart.map(c => ({
      symbol: c.symbol,
      name: c.name,
      buyPrice: Number(c.buyPrice),
      sellPrice: c.sellPrice !== '' ? Number(c.sellPrice) : null,
      shares: Number(c.shares),
      boughtAt: c.boughtAt || null,
      soldAt: c.soldAt || null,
    }));
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { setMessage('Save All failed'); return; }
    setCart([]); setQuery(''); setResults([]);
    setMessage('✅ Saved!');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '1rem' }}>
      <h2>Add Trades</h2>
      {message && <div style={{ marginBottom: 10 }}>{message}</div>}

      <div style={{ display:'flex', gap:8 }}>
        <input
          placeholder="Search (AAPL, BTC-USD, CL=F)"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          onKeyDown={onSearchKey}
          style={{ flex:1, padding:8 }}
        />
        <button onClick={onSearch} disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop:10, border:'1px solid #eee', borderRadius:8, maxHeight:168, overflowY:'auto' }}>
          {results
            .filter(r => r?.symbol && r?.name) // drop empties
            .map(r => (
            <div key={r.symbol} style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', borderBottom:'1px solid #f6f6f6' }}>
              <div>
                <div style={{ fontWeight:600 }}>{r.symbol}</div>
                <div style={{ fontSize:12, color:'#666' }}>{r.name} {r.type ? `• ${r.type}` : ''}</div>
              </div>
              <button onClick={() => addToCart(r)}>Add</button>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <>
          <div style={{ marginTop:10, fontWeight:600 }}>Selected ({cart.length})</div>
          <div style={{ display:'grid', gap:8 }}>
            {cart.map(c => (
              <div key={c.symbol} style={{ display:'grid', gridTemplateColumns:'220px repeat(4,120px) repeat(2,160px) auto', gap:8, alignItems:'center' }}>
                <div>{c.symbol} — <span style={{ color:'#666' }}>{c.name}</span></div>
                <input placeholder="Buy" value={c.buyPrice} onChange={e=>updateCart(c.symbol,'buyPrice',e.target.value)} inputMode="decimal" pattern={moneyPattern.source} style={{ padding:6 }} />
                <input placeholder="Sell (optional)" value={c.sellPrice} onChange={e=>updateCart(c.symbol,'sellPrice',e.target.value)} inputMode="decimal" pattern={moneyPattern.source} style={{ padding:6 }} />
                <input placeholder="Shares" value={c.shares} onChange={e=>updateCart(c.symbol,'shares',e.target.value)} inputMode="decimal" pattern={sharesPattern.source} style={{ padding:6 }} />
                <input type="date" value={c.boughtAt} onChange={e=>updateCart(c.symbol,'boughtAt',e.target.value)} style={{ padding:6 }} />
                <input type="date" value={c.soldAt} onChange={e=>updateCart(c.symbol,'soldAt',e.target.value)} style={{ padding:6 }} />
                <button onClick={() => removeFromCart(c.symbol)} style={{ color:'crimson' }}>Remove</button>
              </div>
            ))}
          </div>
          <button style={{ marginTop:8 }} onClick={saveAll}>Save All</button>
        </>
      )}
    </div>
  );
}