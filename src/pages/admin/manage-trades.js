import { useEffect, useMemo, useState } from "react";
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ArrowBack, ClearAllOutlined, RefreshOutlined, Search } from "@mui/icons-material";
import AdminGuard from "@/components/adminGuard";

const moneyPattern = /^\d+(\.\d{1,2})?$/;
const sharesPattern = /^\d+(\.\d+)?$/;

const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const fmtMoney = (v) => {
    if (v == null || v === "") return "—";
    const n = typeof v === "number" ? v : Number(v);
    if (!isFinite(n)) return "—";
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


export default function ManageTrades() {
    // table state
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // filters
    const [status, setStatus] = useState("");
    const [nameQ, setNameQ] = useState("");

    // sorting
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState("desc");

    // inline edit
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ buyPrice: "", sellPrice: "", shares: "", boughtAt: "", soldAt: "" });
    const [savingId, setSavingId] = useState(null);

    // Selection state for bulk actions
    const [selectedIds, setSelectedIds] = useState(new Set());
    const isSelected = (id) => selectedIds.has(id);
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            const allSelected = rows.every(r => next.has(r._id));
            if (allSelected) {
                rows.forEach(r => next.delete(r._id));
            } else {
                rows.forEach(r => next.add(r._id));
            }
            return next;
        });
    };
    const clearSelection = () => setSelectedIds(new Set());
    const selectedCount = selectedIds.size;

    async function load(p = page) {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize), q: nameQ, status });
            const res = await fetch(`/api/trades?${params.toString()}`);
            const data = await res.json();
            setRows(data.items || []);
            setTotal(data.total || 0);
            setPage(data.page || p);
        } catch {
            setError("Failed to load trades");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(1); }, [status]);

    const profitOf = (r) => {
        if (!r.soldAt || r.sellPrice == null) return null;
        return (Number(r.sellPrice ?? 0) - Number(r.buyPrice ?? 0)) * Number(r.shares ?? 0);
    };

    const sortedRows = useMemo(() => {
        if (!sortBy) return rows;
        const copy = [...rows];
        copy.sort((a, b) => {
            const av = sortBy === "profit" ? (profitOf(a) ?? Number.NEGATIVE_INFINITY) : Number(a.shares ?? 0);
            const bv = sortBy === "profit" ? (profitOf(b) ?? Number.NEGATIVE_INFINITY) : Number(b.shares ?? 0);
            return sortDir === "asc" ? av - bv : bv - av;
        });
        return copy;
    }, [rows, sortBy, sortDir]);

    const toggleSort = (col) => {
        if (sortBy !== col) { setSortBy(col); setSortDir("desc"); }
        else setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    };

    const startEdit = (r) => {
        setEditingId(r._id);
        setForm({
            buyPrice: r.buyPrice?.toFixed?.(2) ?? "",
            sellPrice: r.sellPrice != null ? Number(r.sellPrice).toFixed(2) : "",
            shares: r.shares ?? "",
            boughtAt: r.boughtAt ? new Date(r.boughtAt).toISOString().slice(0, 10) : "",
            soldAt: r.soldAt ? new Date(r.soldAt).toISOString().slice(0, 10) : "",
        });
        setError("");
    };
    const cancelEdit = () => {
        setEditingId(null);
        setForm({ buyPrice: "", sellPrice: "", shares: "", boughtAt: "", soldAt: "" });
    };
    const onEdit = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const saveRow = async (id) => {
        if (!moneyPattern.test(String(form.buyPrice))) { setError("Buy must be a number with up to 2 decimals."); return; }
        if (!sharesPattern.test(String(form.shares)) || Number(form.shares) <= 0) { setError("Shares must be a positive number."); return; }
        const hasSoldDate = !!form.soldAt;
        const hasSellPrice = form.sellPrice !== "" && form.sellPrice != null;
        if (hasSoldDate !== hasSellPrice) { setError("Provide both Sold date and Sell price, or neither."); return; }
        if (hasSellPrice && !moneyPattern.test(String(form.sellPrice))) { setError("Sell must be a number with up to 2 decimals."); return; }

        try {
            setSavingId(id);
            const body = {
                buyPrice: Number(form.buyPrice),
                shares: Number(form.shares),
                boughtAt: form.boughtAt || null,
                soldAt: form.soldAt || null,
                sellPrice: hasSellPrice ? Number(form.sellPrice) : null,
            };
            const res = await fetch(`/api/trades/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error("Update failed");
            await load(page);
            cancelEdit();
        } catch {
            setError("Failed to save changes.");
        } finally {
            setSavingId(null);
        }
    };

    const deleteRow = async (id) => {
        if (!confirm("Delete this trade?")) return;
        try {
            const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            await load(page);
        } catch {
            setError("Failed to delete trade.");
        }
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected trade(s)?`)) return;
        try {
            const res = await fetch('/api/trades/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            if (!res.ok) throw new Error('Bulk delete failed');
            clearSelection();
            await load(page);
        } catch {
            setError('Failed to delete some trades.');
        }
    };

    const resetAll = async () => {
        setNameQ("");
        setStatus("");
        setSortBy(null);
        setSortDir("desc");
        await load(1);
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const SortIcon = ({ active }) => active
        ? (sortDir === "desc" ? <ArrowDownIcon className="h-4 w-4 inline ml-1" /> : <ArrowUpIcon className="h-4 w-4 inline ml-1" />)
        : <span className="text-gray-300 ml-1">↕</span>;

    return (
        <AdminGuard>
            <div className="mx-auto max-w-7xl h-[750px] flex flex-col pt-16">
                {/* Title and Description */}
                <div className='flex justify-between flex-row items-center mb-6'>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <Link href={'/admin/console'} className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-fit py-2 leading-none flex items-center gap-1">
                            <ArrowBack /> Console
                        </Link>
                        <div className="flex gap-2 flex-col">
                            <h2 className="text-4xl font-bold">Manage Trades</h2>
                            <p className="text-customBlack">Manage existing trades (edit or delete). Use the filters to narrow results.</p>
                        </div>
                    </div>
                    <Link href="/admin/add-trades" className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-fit py-2">
                        Add Trades
                    </Link>
                </div>
                {/* Table */}
                <div className="bg-white rounded-xl overflow-auto">
                    {/* Header (sticky top inside the card) */}
                    <div className="px-4 md:px-6 pt-5 pb-4 shrink-0 flex flex-wrap items-center gap-3 justify-end font-headings sticky">
                        {/* Tabs */}
                        <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
                            {[
                                { label: "All", value: "" },
                                { label: "Open", value: "open" },
                                { label: "Closed", value: "closed" },
                            ].map((t) => (
                                <button
                                    key={t.label}
                                    onClick={() => setStatus(t.value)}
                                    className={`px-3 py-1.5 text-sm font-semibold mx-0.5 rounded-md ${status === t.value ? 'bg-top-orange text-white' : 'text-customBlack hover:bg-gray-200'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Search className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name or symbol"
                                value={nameQ}
                                onChange={(e) => setNameQ(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') load(1); }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
                            />
                        </div>
                        <button onClick={resetAll} className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><ClearAllOutlined className="h-5 w-5" /></button>
                    </div>

                    {/* Body (fills remaining height; inner scroll) */}
                    <div className="flex-1 overflow-hidden font-numbers">
                        {error && <div className="px-4 md:px-6 pb-2 text-red-600">{error}</div>}
                        {/* Heading above table */}
                        <div className="h-full overflow-auto">
                            <table className="w-full table-auto">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="text-left border-y border-gray-200">
                                        <th className="p-3 md:p-4 w-10">
                                            <input type="checkbox" onChange={toggleSelectAll} checked={rows.length > 0 && rows.every(r => selectedIds.has(r._id))} className="h-4 w-4" />
                                        </th>
                                        <th className="p-3 md:p-4 whitespace-nowrap">Name</th>
                                        <th className="p-3 md:p-4 whitespace-nowrap">Buy</th>
                                        <th className="p-3 md:p-4 whitespace-nowrap hidden sm:table-cell">Sell</th>
                                        <th className="p-3 md:p-4 whitespace-nowrap cursor-pointer" onClick={() => toggleSort("shares")}>
                                            Shares <SortIcon active={sortBy === "shares"} />
                                        </th>
                                        <th className="p-3 md:p-4 whitespace-nowrap">Status</th>
                                        <th className="p-3 md:p-4 whitespace-nowrap hidden sm:table-cell cursor-pointer" onClick={() => toggleSort("profit")}>
                                            Profit <SortIcon active={sortBy === "profit"} />
                                        </th>
                                        <th className="p-3 md:p-4 whitespace-nowrap hidden md:table-cell">Bought</th>
                                        <th className="p-3 md:p-4 whitespace-nowrap hidden lg:table-cell">Sold</th>
                                        <th className="p-3 md:p-4 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRows.map((r, idx) => {
                                        const isEditing = editingId === r._id;
                                        const profit = profitOf(r);
                                        const last = idx === sortedRows.length - 1;
                                        return (
                                            <tr key={r._id} className={last ? "" : "border-b border-gray-200"}>
                                                {/* Select checkbox */}
                                                <td className="p-3 md:p-4">
                                                    <input type="checkbox" checked={isSelected(r._id)} onChange={() => toggleSelect(r._id)} className="h-4 w-4" />
                                                </td>

                                                {/* Item */}
                                                <td className="p-3 md:p-4">
                                                    <div className="">
                                                        <div className="text-sm font-semibold text-gray-900 truncate">{r.symbol}</div>
                                                        <div className="text-sm text-gray-600 truncate">{r.name || ""}</div>
                                                    </div>
                                                </td>

                                                {/* Buy */}
                                                <td className="p-3 md:p-4">
                                                    {isEditing ? (
                                                        <div className="relative w-24 md:w-28">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                                                            <input
                                                                name="buyPrice"
                                                                value={form.buyPrice}
                                                                onChange={onEdit}
                                                                inputMode="decimal"
                                                                className="w-full rounded-md border border-gray-300 pl-6 pr-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange"
                                                            />
                                                        </div>
                                                    ) : fmtMoney(r.buyPrice)}
                                                </td>

                                                {/* Sell (hidden on xs) */}
                                                <td className="p-3 md:p-4 hidden sm:table-cell">
                                                    {isEditing ? (
                                                        <div className="relative w-24 md:w-28">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                                                            <input
                                                                name="sellPrice"
                                                                value={form.sellPrice}
                                                                onChange={onEdit}
                                                                inputMode="decimal"
                                                                className="w-full rounded-md border border-gray-300 pl-6 pr-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange"
                                                            />
                                                        </div>
                                                    ) : fmtMoney(r.sellPrice)}
                                                </td>

                                                {/* Shares */}
                                                <td className="p-3 md:p-4">
                                                    {isEditing ? (
                                                        <input name="shares" value={form.shares} onChange={onEdit} className="w-20 md:w-24 rounded-md border border-gray-300 px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange" />
                                                    ) : Number(r.shares ?? 0)}
                                                </td>

                                                {/* Status */}
                                                <td className="p-3 md:p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${r.soldAt ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-100 text-gray-700 ring-gray-300'}`}>
                                                        {r.soldAt ? 'Closed' : 'Open'}
                                                    </span>
                                                </td>

                                                {/* Profit (hidden on xs) */}
                                                <td className="p-3 md:p-4 font-semibold hidden sm:table-cell">
                                                    {fmtMoney(profit)}
                                                </td>

                                                {/* Bought (hidden on small) */}
                                                <td className="p-3 md:p-4 hidden md:table-cell">
                                                    {isEditing ? (
                                                        <input type="date" name="boughtAt" value={form.boughtAt} onChange={onEdit} className="w-32 md:w-40 rounded-md border border-gray-300 px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange" />
                                                    ) : fmtDate(r.boughtAt)}
                                                </td>

                                                {/* Sold (hidden on lg-) */}
                                                <td className="p-3 md:p-4 hidden lg:table-cell">
                                                    {isEditing ? (
                                                        <input type="date" name="soldAt" value={form.soldAt} onChange={onEdit} className="w-32 md:w-40 rounded-md border border-gray-300 px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange" />
                                                    ) : fmtDate(r.soldAt)}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-3 md:p-4">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => saveRow(r._id)} disabled={savingId === r._id} className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                                                                {savingId === r._id ? "Saving…" : "Save"}
                                                            </button>
                                                            <button onClick={cancelEdit} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => startEdit(r)} className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100" title="Edit">
                                                                <PencilIcon className="h-5 w-5" />
                                                            </button>
                                                            <button onClick={() => deleteRow(r._id)} className="rounded-md border border-red-300 p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {sortedRows.length === 0 && (
                                        <tr>
                                            <td className="p-6 text-gray-500" colSpan={10}>No trades found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer / Pagination (sticky bottom within the card) */}
                    <div className="px-4 md:px-6 pb-5 pt-3 shrink-0 border-t border-gray-200 font-headings">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-8">
                                <span className="text-sm text-gray-600">Page {page} / {Math.max(1, Math.ceil(total / pageSize))}</span>
                                {selectedCount > 0 && (
                                    <div className="flex items-center gap-4">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                            <span>{selectedCount} selected</span>
                                            <button onClick={clearSelection} className="text-gray-600 hover:text-gray-800 underline">Clear</button>
                                        </div>
                                        <button onClick={deleteSelected} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Delete Selected</button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => load(1)} disabled={loading} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"><RefreshOutlined className="h-5 w-5" /></button>
                                <button onClick={() => page > 1 && load(page - 1)} disabled={page <= 1} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">Prev</button>
                                <button onClick={() => page < Math.max(1, Math.ceil(total / pageSize)) && load(page + 1)} disabled={page >= Math.max(1, Math.ceil(total / pageSize))} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}