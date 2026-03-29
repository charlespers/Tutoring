import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Students only" }, { status: 403 });
  }

  const body = await req.json();
  const inviteCode = (body.inviteCode || "").toString().trim().toUpperCase();
  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({
    where: { inviteCode },
  });
  if (!cls) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  await prisma.classEnrollment.upsert({
    where: {
      classId_studentId: { classId: cls.id, studentId: session.user.id },
    },
    create: { classId: cls.id, studentId: session.user.id },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
