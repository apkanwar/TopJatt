import AdminGuard from '@/components/adminGuard';
import { ArrowBack, Check, Restore } from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ManageAbout() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [serverText, setServerText] = useState('');
    const [text, setText] = useState('');

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/fetch-about', { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            console.log('Fetched about data:', data);
            const content = data?.content ?? '';
            setServerText(content);
            setText(content);
        } catch (e) {
            console.error('Load about failed', e);
            setError('Failed to load About content.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const dirty = text !== serverText;

    async function save() {
        if (!dirty) return;
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/fetch-about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            setServerText(text);
        } catch (e) {
            console.error('Save about failed', e);
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    }

    function resetLocal() {
        setText(serverText);
    }

    return (
        <AdminGuard>
            <div className="mx-auto max-w-5xl px-4 pt-16">
                {/* Header */}
                <div className="mb-6">
                  {/* Mobile layout: actions row + centered title */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-center">
                      <Link
                        href="/admin/console"
                        className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-9 py-2 leading-none inline-flex items-center gap-1"
                      >
                        <ArrowBack fontSize="small" /> Console
                      </Link>
                      <span className="inline-block" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-center">Manage About</h2>
                      <p className="text-customBlack text-center">Update the About Page text shown publicly.</p>
                    </div>
                  </div>
                
                  {/* Tablet/Desktop layout: three-column header */}
                  <div className="hidden sm:flex flex-col md:flex-row md:items-center gap-4 md:gap-8 pb-6">
                    <Link href={'/admin/console'} className="rounded-lg border-2 bg-transparent font-semibold hover:bg-white font-headings px-4 h-fit py-2 leading-none flex items-center gap-1">
                        <ArrowBack /> Console
                    </Link>
                    <div className="flex gap-2 flex-col">
                        <h2 className="text-4xl font-bold">Manage About</h2>
                        <p className="text-customBlack">Update the About Page text shown publicly.</p>
                    </div>
                </div>
                </div>

                {/* Body Card */}
                <div className="rounded-2xl border bg-white shadow-sm h-[calc(100vh-220px)] flex flex-col">
                    {/* Top bar status */}
                    <div className="px-4 md:px-6 pt-5 pb-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {loading ? 'Loading…' : dirty ? 'Unsaved changes' : 'All changes saved'}
                        </div>
                        {error && <div className="text-sm text-red-600">{error}</div>}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={resetLocal}
                                disabled={!dirty || loading}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            >
                                <Restore />
                            </button>
                            <button
                                onClick={save}
                                disabled={!dirty || loading || saving}
                                className="rounded-md bg-top-orange px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                            >
                                {saving ? (
                                    <span className="flex items-center gap-1"><Check /> Saving…</span>
                                ) : (
                                    <span className="flex items-center gap-1"><Check /> Save</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Editor + Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 md:px-6 pb-5 flex-1 overflow-hidden">
                        {/* Editor */}
                        <div className="flex flex-col h-full">
                            <label className="mb-2 text-sm font-semibold text-gray-800">About Text</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Write or paste the About content here…"
                                className="flex-1 min-h-[220px] rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
                            />
                        </div>

                        {/* Preview */}
                        <div className="flex flex-col h-full">
                            <label className="mb-2 text-sm font-semibold text-gray-800">Live Preview</label>
                            <div className="flex-1 min-h-[220px] rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-auto">
                                <div className="text-gray-900">
                                    {(!text || text.trim() === '') ? '—' : text.split(/\n\n/).map((block, i) => {
                                        // Unordered list
                                        if (block.startsWith('- ')) {
                                            const items = block.split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2));
                                            return (
                                                <ul key={i} className="list-disc ml-6 mb-2">
                                                    {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                                </ul>
                                            );
                                        }
                                        // Ordered list
                                        if (block.match(/^1\. /)) {
                                            const lines = block.split('\n').filter(line => /^\d+\.\s/.test(line));
                                            const items = lines.map(line => line.replace(/^\d+\.\s/, ''));
                                            return (
                                                <ol key={i} className="list-decimal ml-6 mb-2">
                                                    {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                                </ol>
                                            );
                                        }
                                        // Paragraph with <br />
                                        return (
                                            <p key={i} className="mb-2">
                                                {block.split('\n').map((line, idx, arr) =>
                                                    idx < arr.length - 1
                                                        ? <span key={idx}>{line}<br /></span>
                                                        : <span key={idx}>{line}</span>
                                                )}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}