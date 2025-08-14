// pages/admin-trades.js
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Tabs, TabsHeader, Tab, Input, Select, Option, Button, IconButton, Chip, Typography, Tooltip } from "@material-tailwind/react";
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Sparklines, SparklinesLine } from "react-sparklines";

const moneyPattern = /^\d+(\.\d{1,2})?$/;
const sharesPattern = /^\d+(\.\d+)?$/;

const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }); // e.g. Aug 13, 2025
};

function SparklineCell({ data }) {
    if (!Array.isArray(data) || data.length === 0) return <span className="text-gray-400">—</span>;
    return (
        <div className="w-[120px] h-[28px]">
            <Sparklines data={data}><SparklinesLine /></Sparklines>
        </div>
    );
}

export default function AdminTradesMT() {
    // table state
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // filters (Material Tailwind – like the Members example)
    const [status, setStatus] = useState(""); // "", "open", "closed"
    const [nameQ, setNameQ] = useState("");

    // sorting
    const [sortBy, setSortBy] = useState(null); // "profit" | "shares"
    const [sortDir, setSortDir] = useState("desc");

    // inline edit
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ buyPrice: "", sellPrice: "", shares: "", boughtAt: "", soldAt: "" });
    const [savingId, setSavingId] = useState(null);

    async function load(p = page) {
        setLoading(true);
        try {
            // Use 'q' for unified search on name or symbol
            const params = new URLSearchParams({
                page: String(p), pageSize: String(pageSize),
                q: nameQ, status,
            });
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
        // profit only if closed
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
        else setSortDir(d => d === "desc" ? "asc" : "desc");
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
    const onEdit = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
            const res = await fetch(`/api/trades/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            });
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
        <Card className="mt-8 max-w-7xl mx-auto">
            <CardHeader floated={false} shadow={false} className="rounded-none px-6 pb-0 pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Typography variant="h5">Trades</Typography>
                        <Typography variant="small" color="gray" className="font-normal">
                            Manage existing trades (edit or delete). Use the filters to narrow results.
                        </Typography>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Tabs value={status || "all"}>
                            <TabsHeader>
                                <Tab value="all" onClick={() => setStatus("")}>All</Tab>
                                <Tab value="open" onClick={() => setStatus("open")}>Open</Tab>
                                <Tab value="closed" onClick={() => setStatus("closed")}>Closed</Tab>
                            </TabsHeader>
                        </Tabs>

                        <div className="w-64">
                            <Input
                                label="Search by name or symbol"
                                value={nameQ}
                                onChange={(e) => setNameQ(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") load(1);
                                }}
                                crossOrigin=""
                            />
                        </div>

                        <Button color="blue" onClick={() => load(1)}>View all</Button>
                        <Button variant="outlined" color="red" onClick={resetAll}>
                            Reset
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardBody className="px-0">
                {error && <div className="text-red-600 px-6 pb-2">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] table-auto">
                        <thead>
                            <tr className="text-left border-y border-blue-gray-50">
                                <th className="p-4">Member</th>
                                <th className="p-4">Buy</th>
                                <th className="p-4">Sell</th>
                                <th className="p-4 cursor-pointer" onClick={() => toggleSort("shares")}>
                                    Shares <SortIcon active={sortBy === "shares"} />
                                </th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Sparkline</th>
                                <th className="p-4 cursor-pointer" onClick={() => toggleSort("profit")}>
                                    Profit <SortIcon active={sortBy === "profit"} />
                                </th>
                                <th className="p-4">Bought</th>
                                <th className="p-4">Sold</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.map((r, idx) => {
                                const isEditing = editingId === r._id;
                                const profit = profitOf(r);
                                const last = idx === sortedRows.length - 1;
                                return (
                                    <tr key={r._id} className={last ? "" : "border-b border-blue-gray-50"}>
                                        {/* Member (Symbol / Name) */}
                                        <td className="p-4">
                                            <div className="min-w-[275px]">
                                                <Typography variant="small" className="font-semibold">{r.symbol}</Typography>
                                                <Typography variant="small" color="gray" className="font-normal">{r.name || ""}</Typography>
                                            </div>
                                        </td>

                                        {/* Buy */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <Input size="md" label="Buy" value={form.buyPrice} onChange={onEdit} name="buyPrice" crossOrigin="" />
                                            ) : (typeof r.buyPrice === "number" ? r.buyPrice.toFixed(2) : "")}
                                        </td>

                                        {/* Sell */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <Input size="md" label="Sell" value={form.sellPrice} onChange={onEdit} name="sellPrice" crossOrigin="" />
                                            ) : (r.sellPrice != null ? Number(r.sellPrice).toFixed(2) : "—")}
                                        </td>

                                        {/* Shares */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <Input size="md" label="Shares" value={form.shares} onChange={onEdit} name="shares" crossOrigin="" />
                                            ) : Number(r.shares ?? 0)}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <Chip
                                                value={r.soldAt ? "Closed" : "Open"}
                                                color={r.soldAt ? "green" : "blue-gray"}
                                                size="sm"
                                                className="w-fit"
                                            />
                                        </td>

                                        {/* Sparkline */}
                                        <td className="p-4">
                                            <SparklineCell data={r.sparkline} />
                                        </td>

                                        {/* Profit */}
                                        <td className="p-4 font-semibold">
                                            {profit == null ? "—" : profit.toFixed(2)}
                                        </td>

                                        {/* Bought */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <Input size="md" type="date" label="Bought" value={form.boughtAt} onChange={onEdit} name="boughtAt" crossOrigin="" />
                                            ) : fmtDate(r.boughtAt)}
                                        </td>

                                        {/* Sold */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <Input size="md" type="date" label="Sold" value={form.soldAt} onChange={onEdit} name="soldAt" crossOrigin="" />
                                            ) : fmtDate(r.soldAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" color="green" onClick={() => saveRow(r._id)} disabled={savingId === r._id}>
                                                        {savingId === r._id ? "Saving…" : "Save"}
                                                    </Button>
                                                    <Button size="sm" variant="text" onClick={cancelEdit}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Tooltip content="Edit">
                                                        <IconButton variant="text" onClick={() => startEdit(r)}>
                                                            <PencilIcon className="h-5 w-5" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip content="Delete">
                                                        <IconButton variant="text" color="red" onClick={() => deleteRow(r._id)}>
                                                            <TrashIcon className="h-5 w-5" />
                                                        </IconButton>
                                                    </Tooltip>
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
            </CardBody>

            <CardFooter className="pt-0 px-6 pb-6">
                <div className="flex items-center justify-between">
                    <Typography variant="small" color="gray">
                        Page {page} / {totalPages}
                    </Typography>
                    <div className="flex items-center gap-2">
                        <Button variant="outlined" size="sm" onClick={() => load(1)} disabled={loading}>Refresh</Button>
                        <Button variant="outlined" size="sm" onClick={() => page > 1 && load(page - 1)} disabled={page <= 1}>Prev</Button>
                        <Button variant="outlined" size="sm" onClick={() => page < totalPages && load(page + 1)} disabled={page >= totalPages}>Next</Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}