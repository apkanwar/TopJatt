import AdminGuard from '@/components/adminGuard';
import Dash from '@/components/dash';
import { Home, Logout } from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminConsole() {
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    function openPwdModal() {
        setShowPwdModal(true);
        setOldPwd(""); setNewPwd(""); setConfirmPwd(""); setMsg(""); setErr("");
    }
    function closePwdModal() { setShowPwdModal(false); }

    async function submitPasswordChange(e) {
        e?.preventDefault?.();
        setMsg(""); setErr("");

        if (!oldPwd || !newPwd || !confirmPwd) {
            setErr("All fields are required.");
            return;
        }
        if (newPwd !== confirmPwd) {
            setErr("New password and confirmation do not match.");
            return;
        }
        if (newPwd.length < 8) {
            setErr("Password must be at least 8 characters.");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: oldPwd, newPassword: newPwd })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErr(data?.error || 'Failed to change password.');
                return;
            }
            setMsg('Password updated. Please log in again.');
            // Optional: auto logout after short delay
            setTimeout(() => {
                closePwdModal();
                signOut({ callbackUrl: '/login' });
            }, 800);
        } catch (e) {
            setErr('Unexpected error.');
        } finally {
            setSaving(false);
        }
    }

    const sections = {
        Account: [
            {
                title: 'Change Password',
                href: null,
                bgColor: 'dashWhite',
            },
        ],
        Trades: [
            {
                title: 'Add Trades',
                href: '/admin/add-trades',
                bgColor: 'dashGreen',
            },
            {
                title: 'Manage Trades',
                href: '/admin/manage-trades',
                bgColor: 'dashGreen',
            },
        ],
        Other: [
            {
                title: 'Manage Achievements',
                href: '/admin/manage-achievements',
                bgColor: 'dashYellow',
            },
            {
                title: 'Manage About',
                href: '/admin/manage-about',
                bgColor: 'dashYellow',
            },
        ],
    };

    return (
        <AdminGuard>
            <div className="mx-auto max-w-5xl px-4 mt-24">
                {/* Header */}
                <div className="mb-6">
                  {/* Mobile layout: actions row + centered title */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <Link
                        href={'/'}
                        className="rounded-lg bg-dashWhite px-3 py-2 text-sm font-semibold text-customBlack hover:opacity-90 inline-flex items-center gap-2"
                      >
                        <Home fontSize="small" /> Home
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="rounded-lg bg-dashWhite px-3 py-2 text-sm font-semibold text-customBlack hover:opacity-90 inline-flex items-center gap-2"
                      >
                        <Logout fontSize="small" /> Logout
                      </button>
                    </div>
                    <h2 className="text-2xl font-bold text-center pt-4">Admin Console</h2>
                  </div>
                
                  {/* Desktop / tablet layout: three-column header */}
                  <div className="hidden sm:grid grid-cols-4 items-center">
                    <div className="justify-self-start">
                      <Link
                        href={'/'}
                        className="rounded-lg bg-dashWhite px-4 py-2 text-sm font-semibold text-customBlack hover:opacity-90 inline-flex items-center gap-2"
                      >
                        <Home /> Home
                      </Link>
                    </div>
                    <div className="justify-self-center col-span-2">
                      <h2 className="text-3xl md:text-4xl font-bold text-center">Admin Console</h2>
                    </div>
                    <div className="justify-self-end">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="rounded-lg bg-dashWhite px-4 py-2 text-sm font-semibold text-customBlack hover:opacity-90 inline-flex items-center gap-2"
                      >
                        <Logout /> Logout
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="mt-10 space-y-12">
                    {Object.entries(sections).map(([sectionTitle, sectionItems]) => (
                        <section key={sectionTitle}>
                            <h3 className="mb-4 text-2xl font-bold text-customBlack">{sectionTitle}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sectionItems.map((item) => (
                                    item.title === 'Change Password' ? (
                                        <button
                                            key={item.title}
                                            type="button"
                                            onClick={openPwdModal}
                                            className={`bg-${item.bgColor} rounded-2xl md:min-h-[120px] p-8 flex flex-col gap-4 text-left focus:outline-none`}
                                        >
                                            <h1 className="text-navyBlue font-numbers text-2xl font-bold">{item.title}</h1>
                                        </button>
                                    ) : (
                                        <Dash
                                            key={item.href}
                                            title={item.title}
                                            bgColor={item.bgColor}
                                            link={item.href}
                                        />
                                    )
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {showPwdModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={closePwdModal} />
                        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg mx-4">
                            <h3 className="text-xl font-semibold text-customBlack mb-4">Change Password</h3>
                            {err && <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
                            {msg && <div className="mb-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</div>}
                            <form onSubmit={submitPasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                                    <input
                                        type="password"
                                        value={oldPwd}
                                        onChange={(e) => setOldPwd(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                                    <input
                                        type="password"
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                                    <input
                                        type="password"
                                        value={confirmPwd}
                                        onChange={(e) => setConfirmPwd(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-top-orange focus:border-top-orange"
                                        required
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-end gap-3">
                                    <button type="button" onClick={closePwdModal} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancel</button>
                                    <button type="submit" disabled={saving} className="rounded-md bg-top-orange px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}