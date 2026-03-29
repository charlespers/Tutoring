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
  const { assignmentId, answers } = body;
  if (!assignmentId || !answers || typeof answers !== "object") {
    return NextResponse.json({ error: "assignmentId and answers required" }, { status: 400 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { questions: { orderBy: { order: "asc" }, include: { question: true } } },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  let score = 0;
  const submissionItems: { questionId: string; answer: string; isCorrect: boolean }[] = [];

  for (const aq of assignment.questions) {
    const userAnswer = (answers[aq.questionId] || "").toString().trim().toUpperCase();
    const correctAnswer = aq.question.answer.trim().toUpperCase();
    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) score++;
    submissionItems.push({
      questionId: aq.question.id,
      answer: userAnswer,
      isCorrect,
    });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.$transaction([
    prisma.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        answers: JSON.stringify(answers),
        score,
        totalQuestions: assignment.questions.length,
        submissionItems: {
          create: submissionItems,
        },
      },
    }),
    prisma.streak.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      create: {
        userId: session.user.id,
        date: today,
        count: 1,
      },
      update: { count: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ score, total: assignment.questions.length });
}
