import { ArrowBack, BackHand, Home, Search } from '@mui/icons-material';
import Link from 'next/link';
import { useRef, useState } from 'react';
import AdminGuard from '@/components/adminGuard';

const moneyPattern = /^\d+(\.\d{1,2})?$/;
const sharesPattern = /^\d+(\.\d+)?$/;

export default function AddTrades() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]); // {symbol,name,buyPrice,sellPrice,shares,boughtAt,soldAt}
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchInfo, setSearchInfo] = useState(''); // shows No results / errors
  const abortRef = useRef(null);

  const onSearch = async () => {
    const q = query.trim();
    if (!q) { setSearchInfo(''); setResults([]); return; }

    // cancel any in-flight search
    try { abortRef.current?.abort(); } catch { }
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSearching(true);
    setResults([]);
    setMessage('');
    setSuccessMessage('');
    setSearchInfo('');

    try {
      const res = await fetch(`/api/search-symbol?query=${encodeURIComponent(q)}`, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) {
        console.error('search-symbol http', res.status);
        setSearchInfo('Search failed');
        return;
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setResults(items);
      setSearchInfo(items.length === 0 ? `No results for "${q}"` : `Found ${items.length}`);
    } catch (err) {
      if (err?.name === 'AbortError') return; // ignored
      console.error('search-symbol error', err);
      setSearchInfo('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const onSearchKey = (e) => { if (e.key === 'Enter') onSearch(); };

  const addToCart = (item) => {
    if (cart.find(c => c.symbol === item.symbol)) return;
    setCart(prev => [...prev, { ...item, buyPrice: '', sellPrice: '', shares: '', boughtAt: '', soldAt: '' }]);
  };
  const removeFromCart = (symbol) => setCart(prev => prev.filter(c => c.symbol !== symbol));
  const updateCart = (symbol, field, value) =>
    setCart(prev => prev.map(c => c.symbol === symbol ? { ...c, [field]: value } : c));

  const saveAll = async () => {
    // validate each
    for (const c of cart) {
      if (!moneyPattern.test(String(c.buyPrice))) { setMessage(`Invalid buy price for ${c.symbol}`); return; }
      if (!sharesPattern.test(String(c.shares)) || Number(c.shares) <= 0) { setMessage(`Invalid shares for ${c.symbol}`); return; }
      const hasSoldDate = !!c.soldAt;
      const hasSellPrice = c.sellPrice !== '' && c.sellPrice != null;
      if (hasSoldDate !== hasSellPrice) { setMessage(`Provide both sold date and sell price for ${c.symbol}, or neither`); return; }
      if (hasSellPrice && !moneyPattern.test(String(c.sellPrice))) { setMessage(`Invalid sell price for ${c.symbol}`); return; }
    }
    setMessage('');
    setSuccessMessage('');
    const payload = cart.map(c => ({
      symbol: c.symbol,
      name: c.name,
      buyPrice: Number(c.buyPrice),
      sellPrice: c.sellPrice !== '' ? Number(c.sellPrice) : null,
      shares: Number(c.shares),
      boughtAt: c.boughtAt || null,
      soldAt: c.soldAt || null,
    }));
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setMessage('Save All failed'); return; }
      setCart([]); setQuery(''); setResults([]);
      setSuccessMessage('✅\nNew Traded Saved!');
      setSearchInfo('');
    } catch (e) {
      console.error('save error', e);
      setSuccessMessage('Save All failed');
    }
  };

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 pt-16">
        {/* Header */}
        <div className="mb-6">
          {/* Mobile layout: actions row + centered title */}
          <div className="sm:hidden space-y-3">
            <div className="flex items-center justify-between">
              <Link
                href="/admin/console"
                className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-9 py-2 leading-none inline-flex items-center gap-1"
              >
                <ArrowBack fontSize="small" /> Console
              </Link>
              <Link
                href="/admin/manage-trades"
                className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-9 py-2 leading-none inline-flex items-center gap-1"
              >
                Edit Trades
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-center pt-4">Add Trades</h2>
          </div>
        
          {/* Tablet/Desktop layout: three-column header */}
          <div className="hidden sm:grid grid-cols-4 items-center">
            <div className="justify-self-start">
              <Link
                href="/admin/console"
                className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-fit py-2 leading-none inline-flex items-center gap-1"
              >
                <ArrowBack /> Console
              </Link>
            </div>
            <div className="justify-self-center col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold text-center">Add Trades</h2>
            </div>
            <div className="justify-self-end">
              <Link
                href="/admin/manage-trades"
                className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-fit py-2 leading-none inline-flex items-center gap-1"
              >
                Edit Trades
              </Link>
            </div>
          </div>
        </div>
        {message && (
          <div className="rounded-md font-semibold text-gray-700 px-4 py-2 mb-4 bg-white">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 h-[calc(600px)] overflow-hidden">
          {/* LEFT SIDEBAR: Search + Results */}
          <aside className="md:col-span-4 lg:col-span-4 h-full">
            <div className="h-full flex flex-col rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-gray-700">Search Symbols</div>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  placeholder="NYSE, TSX or Crypto"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKey}
                  className="w-full rounded-full border pl-10 pr-5 py-2 text-black font-headings focus:outline-none focus:ring-2 focus:ring-top-orange"
                />
              </div>
              {searchInfo &&
                <div className="font-headings mt-8 text-sm text-black text-center font-semibold">
                  {searchInfo}
                </div>
              }

              {/* Results (fills remaining height) */}
              {results.length > 0 && (
                <div className="mt-2 flex-1 overflow-y-auto rounded-lg border border-gray-200">
                  {results
                    .filter(r => r?.symbol && r?.name)
                    .slice(0, 20)
                    .map((r, idx) => (
                      <div key={`${r.symbol}-${idx}`} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0">
                        <div className='flex flex-col gap-1'>
                          <div className="font-bold text-customBlack">{r.symbol}</div>
                          <div className="font-medium text-gray-700">{r.name}</div>
                        </div>
                        <button onClick={() => addToCart(r)} className="rounded-full border bg-dashWhite px-5 py-1.5 text-sm font-semibold border-amber-900 hover:bg-white">
                          Add
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT MAIN: Selected Trades */}
          <main className="md:col-span-8 lg:col-span-8 h-full">
            <div className="h-full flex flex-col rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-between">
                <div className="text-sm font-semibold text-gray-700">Selected ({cart.length})</div>
                {cart.length > 0 && (
                  <div className="flex">
                    <button onClick={saveAll} className="rounded-md bg-green-50 px-5 py-2.5 font-semibold text-green-600 shadow hover:bg-green-100 ring-1 ring-inset ring-green-600">
                      Save All
                    </button>
                  </div>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  {successMessage ? (
                    <div className="bg-navyBlue text-white px-8 py-4 whitespace-pre-line rounded-lg font-numbers font-bold text-lg text-center">
                      {successMessage}
                    </div>
                  ) : (
                    <div className="text-gray-500">No Trades Selected Yet.</div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3">
                  {cart.map((c) => (
                    <div key={c.symbol} className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg border">
                      <div className="truncate justify-between flex items-center">
                        <div className='font-headings'>
                          <span className="font-semibold">{c.symbol}</span>
                          <span> — {c.name}</span>
                        </div>

                        <button onClick={() => removeFromCart(c.symbol)} className="justify-self-end rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100">
                          Remove
                        </button>
                      </div>

                      <div className="flex flex-row gap-3">
                        {/* Buy Price */}
                        <div className="relative w-full">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <input
                            placeholder="Buy"
                            value={c.buyPrice}
                            onChange={(e) => updateCart(c.symbol, 'buyPrice', e.target.value)}
                            inputMode="decimal"
                            pattern={moneyPattern.source}
                            className="w-full rounded-md border pl-7 pr-3 py-2"
                          />
                        </div>

                        {/* Sell Price */}
                        <div className="relative w-full">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <input
                            placeholder="Sell"
                            value={c.sellPrice}
                            onChange={(e) => updateCart(c.symbol, 'sellPrice', e.target.value)}
                            inputMode="decimal"
                            pattern={moneyPattern.source}
                            className="w-full rounded-md border pl-7 pr-3 py-2"
                          />
                        </div>

                        {/* Shares */}
                        <input
                          placeholder="Shares"
                          value={c.shares}
                          onChange={(e) => updateCart(c.symbol, 'shares', e.target.value)}
                          inputMode="decimal"
                          pattern={sharesPattern.source}
                          className="w-full rounded-md border px-3 py-2"
                        />

                        {/* Dates */}
                        <input
                          type="date"
                          value={c.boughtAt}
                          onChange={(e) => updateCart(c.symbol, 'boughtAt', e.target.value)}
                          className="w-full rounded-md border px-3 py-2"
                        />
                        <input
                          type="date"
                          value={c.soldAt}
                          onChange={(e) => updateCart(c.symbol, 'soldAt', e.target.value)}
                          className="w-full rounded-md border px-3 py-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}