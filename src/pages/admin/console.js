import AdminGuard from '@/components/adminGuard';
import Dash from '@/components/dash';
import { useSession, signOut } from 'next-auth/react';

export default function AdminConsole() {
    const { data: session } = useSession();
    const items = [
        {
            title: 'Manage Achievements',
            href: '/admin/manage-achievements',
            bgColor: 'dashWhite',
        },
        {
            title: 'Manage About',
            href: '/admin/manage-about',
            bgColor: 'dashWhite',
        },
        {
            title: 'Manage Trades',
            href: '/admin/manage-trades',
            bgColor: 'dashWhite',
        },
    ];

    return (
        <AdminGuard>
            <div className="mx-auto max-w-5xl px-4 pt-16">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-customBlack">Admin Console</h1>
                        <p className="text-sm text-gray-600">Quick links to manage site content.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {session?.user?.username && (
                            <span className="hidden sm:inline text-sm text-gray-600">{session.user.username}</span>
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="rounded-md bg-top-orange px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <Dash
                            key={item.href}
                            title={item.title}
                            image={item.image}
                            bgColor={item.bgColor}
                            imageWidth={item.imageWidth}
                            link={item.href}
                        />
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-8 text-xs text-gray-500">
                    Protected by middleware. If you log out, all /admin routes will redirect to the login page.
                </div>
            </div>
        </AdminGuard>
    );
}