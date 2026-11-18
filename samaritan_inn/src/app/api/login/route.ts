import { NextResponse } from 'next/server';

// Hidden: this endpoint is no longer used and always answers 404.
// Logins go through NextAuth (/api/auth/[...nextauth]). The original code is kept
// below, commented out, for reference.
function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
export const GET = notFound;
export const POST = notFound;

// ---- Original implementation (disabled) ----------------------------------------
// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// 
// const prisma = new PrismaClient();
// 
// export async function POST(req: Request) {
//   const { email, password } = await req.json();
// 
//   if (!email || !password) {
//     return NextResponse.json(
//       { message: 'Email and password are required' },
//       { status: 400 }
//     );
//   }
// 
//   const user = await prisma.user.findUnique({
//     where: { email },
//   });
// 
//   // Note: In production, use proper password hashing and validation.
//   if (!user || user.password !== password) {
//     return NextResponse.json(
//       { message: 'Invalid credentials' },
//       { status: 401 }
//     );
//   }
// 
//   // Here, create a session or token as needed.
//   return NextResponse.json({ message: 'Login successful', user });
// }
