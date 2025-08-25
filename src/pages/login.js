import { getCsrfToken, getSession } from "next-auth/react";
import { useState } from "react";
import { NextSeo } from "next-seo";

export default function Login({ csrfToken }) {
    const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
    return (
        <>
            <NextSeo
                title="TopJatt - Login"
                description='An inside view of the mind of a pro trader!'
                canonical='https://www.topjatt.com/'
                openGraph={{
                    url: 'https://www.topjatt.xyz/',
                    title:
                        "TopJatt - Home",
                    description:
                        'An inside view of the mind of a pro trader!',
                    images: [
                        {
                            url: '/icon.png',
                            width: 500,
                            height: 500,
                            alt: 'TopJatt Logo',
                            type: 'image/png'
                        }
                    ],
                    siteName: 'TopJatt'
                }}
            />
            <div className="min-h-screen flex items-center justify-center bg-dashWhite px-4">
                <div className="mx-auto flex w-full max-w-4xl items-center justify-center p-6 lg:p-28">
                    <div className="shadow-lg bg-[linear-gradient(135deg,#ff9966_0%,#ff5e62_100%)] rounded-2xl flex flex-col p-6 py-12 w-full md:min-w-[700px] md:py-24 md:p-20">
                        <div className="font-headings text-2xl text-center text-white font-semibold md:text-4xl">
                            Welcome Back
                        </div>

                        <form method="post" action="/api/auth/callback/credentials" className="mt-10 space-y-6">
                            {/* Required by NextAuth */}
                            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                            <input name="callbackUrl" type="hidden" value="/admin/console" />

                            <div>
                                <label htmlFor="username" className="block text-white mb-2 text-lg">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-full border border-black/40 bg-white px-6 py-3 text-black focus:outline-none focus:ring-2 focus:ring-white/60"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-white mb-2 text-lg">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-full border border-black/40 bg-white px-6 py-3 text-black focus:outline-none focus:ring-2 focus:ring-white/60"
                                />
                            </div>

                            <div className="pt-6 flex items-center justify-center">
                                <button type="submit" className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-black shadow hover:opacity-95">
                                    Sign In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (session) {
        return {
            redirect: {
                destination: "/admin/console",
                permanent: false,
            },
        };
    }
    const csrfToken = await getCsrfToken(ctx);
    return { props: { csrfToken } };
}