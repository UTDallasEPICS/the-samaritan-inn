import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';

// TODO: Implement POST handler for WorkSchedule
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function GET() {
  const data = await prisma.workSchedule.findMany();
  return Response.json(data);
}