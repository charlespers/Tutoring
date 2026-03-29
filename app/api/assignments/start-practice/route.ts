import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Students only" }, { status: 403 });
  }

  const questions = await prisma.question.findMany({
    take: 5,
    orderBy: { id: "asc" },
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No practice questions available yet." },
      { status: 400 }
    );
  }

  const systemTeacher = await prisma.user.findUnique({
    where: { email: "system@satpreppro.com" },
  });
  if (!systemTeacher) {
    return NextResponse.json({ error: "System not configured" }, { status: 500 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      title: "Welcome Practice",
      teacherId: systemTeacher.id,
      questions: {
        create: questions.map((q, i) => ({
          questionId: q.id,
          order: i,
        })),
      },
    },
  });

  return NextResponse.json({ assignmentId: assignment.id });
}
