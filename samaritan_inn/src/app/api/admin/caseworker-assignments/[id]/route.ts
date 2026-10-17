import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/caseworker-directory";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  const { id } = await params;

  const { count } = await prisma.caseworkerAssignment.deleteMany({
    where: { id },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
