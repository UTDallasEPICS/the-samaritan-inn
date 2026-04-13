import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

if (!process.env.NEXTAUTH_URL) console.warn("Warning: NEXTAUTH_URL not set");
if (!process.env.NEXTAUTH_SECRET) console.warn("Warning: NEXTAUTH_SECRET not set");

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
