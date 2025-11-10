import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ✅ Full NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Example hardcoded user — replace with your real DB query
        const user = {
          id: "1",
          name: "John Doe",
          email: credentials?.email ?? "user@example.com",
          role: "user", // or "admin"
        };

        if (user) return user;
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

// ✅ Reusable session utilities
export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/unauthorized");
  return user;
}

// ✅ NEW: requireUser() for Curfew Page
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "user") redirect("/unauthorized");
  return user;
}
