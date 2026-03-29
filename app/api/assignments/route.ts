import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const body = await req.json();
  const { title, classId, questionCount = 5 } = body;
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    take: Math.min(Number(questionCount) || 5, 50),
    orderBy: { id: "asc" },
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No questions in bank yet. Questions will be added soon." },
      { status: 400 }
    );
  }

  let classToUse: string | null = null;
  if (classId) {
    const classCheck = await prisma.class.findFirst({
      where: { id: classId, teacherId: session.user.id },
    });
    if (classCheck) classToUse = classCheck.id;
  }

  const assignment = await prisma.assignment.create({
    data: {
      title: title.trim(),
      classId: classToUse,
      teacherId: session.user.id,
      questions: {
        create: questions.map((q, i) => ({
          questionId: q.id,
          order: i,
        })),
      },
    },
    include: { questions: { include: { question: true } } },
  });

  return NextResponse.json({ id: assignment.id });
}
