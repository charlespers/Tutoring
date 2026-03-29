import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: classId } = await params;

  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId: session.user.id },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const body = await req.json();
  const { email } = body;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: { email: email.trim(), role: "STUDENT" },
  });
  if (!student) {
    return NextResponse.json(
      { error: "No student account found with this email. Ask them to sign up first." },
      { status: 400 }
    );
  }

  await prisma.classEnrollment.upsert({
    where: {
      classId_studentId: { classId, studentId: student.id },
    },
    create: { classId, studentId: student.id },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
