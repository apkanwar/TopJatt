import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ClearAllOutlined, Refresh, Search } from '@mui/icons-material';

const fmtImg = (logo) => (logo ? logo : '');

export default function ManageAchievements() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // search (name only)
    const [q, setQ] = useState('');

    // editing state (inline per row)
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', logo: '' });
    const onEdit = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    // create modal
    const [openNew, setOpenNew] = useState(false);
    const [newForm, setNewForm] = useState({ title: '', description: '', logo: '' });
    const onNew = (e) => setNewForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    async function load(p = page) {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
            if (q.trim()) params.set('q', q.trim()); // server should search by title only
            const res = await fetch(`/api/achievements?${params.toString()}`);
            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || 0);
            setPage(data.page || p);
        } catch (e) {
            setError('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(1); }, []);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const startEdit = (a) => {
        setEditingId(a._id);
        setForm({
            title: a.title || '',
            description: a.description || '',
            logo: a.logo || '',
        });
    };
    const cancelEdit = () => { setEditingId(null); setForm({ title: '', description: '', logo: '' }); };

    const saveEdit = async (id) => {
        if (!form.title.trim()) { setError('Name is required'); return; }
        try {
            const res = await fetch(`/api/achievements/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    logo: form.logo.trim() || null,
                }),
            });
            if (!res.ok) throw new Error('update failed');
            await load(page);
            cancelEdit();
        } catch (e) {
            setError('Failed to save changes');
        }
    };

    const deleteOne = async (id) => {
        if (!confirm('Delete this achievement?')) return;
        try {
            const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('delete failed');
            await load(page);
        } catch (e) {
            setError('Failed to delete');
        }
    };

    const createOne = async () => {
        if (!newForm.title.trim()) return;
        try {
            const res = await fetch('/api/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newForm.title.trim(),
                    description: newForm.description.trim(),
                    logo: newForm.logo.trim() || null,
                }),
            });
            if (!res.ok) throw new Error('create failed');
            setOpenNew(false);
            setNewForm({ title: '', description: '', logo: '' });
            await load(1);
        } catch (e) {
            setError('Failed to create');
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 pt-16">
            {/* Header */}
            <div className="flex gap-2 flex-col pb-8">
                <h2 className="text-4xl font-bold">Manage Achievements</h2>
                <p className="text-customBlack">Add, Update, or Delete Achievements.</p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border bg-white shadow-sm h-[600px] flex flex-col">
                {/* Top controls - search left, Add right */}
                <div className="px-4 md:px-6 pt-5 pb-4 flex items-center gap-3">
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Search className="h-5 w-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search achievements by name"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') load(1); }}
                            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
                        />
                    </div>

                    <button onClick={() => { setQ(''); load(1); }} className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><ClearAllOutlined className="h-5 w-5" /></button>

                    <div className="ml-auto">
                        <button
                            onClick={() => setOpenNew(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-transparent hover:bg-top-orange px-3 py-2 text-sm font-semibold text-customBlack hover:text-white border border-black hover:border-none"
                            title="Add achievement"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* List body */}
                <div className="flex-1 overflow-hidden">
                    {error && <div className="px-4 md:px-6 text-red-600">{error}</div>}
                    <div className="h-full overflow-auto px-2 md:px-4 pb-4">
                        {items.length === 0 ? (
                            <div className="flex items-center justify-center py-16 text-gray-500 text-lg">No Achievements Yet</div>
                        ) : (
                            <ul className="divide-y divide-gray-200 px-2">
                                {items.map((a) => {
                                    const isEditing = editingId === a._id;
                                    return (
                                        <li key={a._id} className="py-4">
                                            <div className="flex items-start gap-6">
                                                {/* Icon */}
                                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-dashGreen border-topOrange">
                                                    {a.logo ? (
                                                        <img alt="" src={fmtImg(a.logo)} className="h-full w-full object-contain" />
                                                    ) : (
                                                        <div className="h-full w-full bg-gray-200" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="min-w-0 flex-1">
                                                    {isEditing ? (
                                                        <input
                                                            name="title"
                                                            value={form.title}
                                                            onChange={onEdit}
                                                            placeholder="Name"
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange"
                                                        />
                                                    ) : (
                                                        <h3 className="text-lg font-semibold text-customBlack truncate">{a.title}</h3>
                                                    )}

                                                    {isEditing ? (
                                                        <textarea
                                                            name="description"
                                                            value={form.description}
                                                            onChange={onEdit}
                                                            rows={2}
                                                            placeholder="Description"
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange"
                                                        />
                                                    ) : (
                                                        <p className="mt-1 text-gray-700 whitespace-pre-line">{a.description}</p>
                                                    )}

                                                    {isEditing && (
                                                        <div className="mt-2">
                                                            <label className="block text-xs text-gray-600 mb-1">Icon URL</label>
                                                            <input
                                                                name="logo"
                                                                value={form.logo}
                                                                onChange={onEdit}
                                                                placeholder="https://..."
                                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="ml-2 flex shrink-0 items-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={() => saveEdit(a._id)} className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700">Save</button>
                                                            <button onClick={cancelEdit} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => startEdit(a)} className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100" title="Edit">
                                                                <PencilIcon className="h-5 w-5" />
                                                            </button>
                                                            <button onClick={() => deleteOne(a._id)} className="rounded-md border border-red-300 p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Footer / Pagination */}
                <div className="px-4 md:px-6 pb-5 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Page {page} / {totalPages} • Showing {items.length} of {total}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => load(1)} disabled={loading} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"><Refresh /></button>
                            <button onClick={() => page > 1 && load(page - 1)} disabled={page <= 1} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">Prev</button>
                            <button onClick={() => page < totalPages && load(page + 1)} disabled={page >= totalPages} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {openNew && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpenNew(false)} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Add Achievement</h3>
                                <button onClick={() => setOpenNew(false)} className="p-1 text-gray-500 hover:text-gray-700"><XMarkIcon className="h-5 w-5" /></button>
                            </div>

                            <div className="px-5 py-4 space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Name</label>
                                    <input name="title" value={newForm.title} onChange={onNew} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="e.g., First 10 Trades" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={newForm.description} onChange={onNew} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Short description" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Icon URL (optional)</label>
                                    <input name="logo" value={newForm.logo} onChange={onNew} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="https://logo.clearbit.com/apple.com" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
                                <button onClick={() => setOpenNew(false)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancel</button>
                                <button onClick={createOne} className="rounded-md bg-top-orange px-3 py-2 text-sm font-semibold text-white hover:opacity-90">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}