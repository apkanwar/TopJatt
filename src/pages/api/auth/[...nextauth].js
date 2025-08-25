import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" }, // optional: custom login page (see step 3)
    providers: [
        Credentials({
            name: "Admin Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize({ username, password }) {
                if (!username || !password) return null;
                const client = await clientPromise;
                const user = await client
                    .db("my_app")
                    .collection("users")
                    .findOne({ username: username.toLowerCase(), role: "admin" });
                if (!user) return null;
                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) return null;
                return { id: user._id.toString(), username: user.username, role: "admin", name: "Admin" };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role || "admin";
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = { ...session.user, role: token.role || "admin", username: token.username };
            return session;
        },
    },
};

export default NextAuth(authOptions);