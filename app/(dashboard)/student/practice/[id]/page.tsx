import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { PracticeTake } from "@/components/student/PracticeTake";

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const { onboarding } = await searchParams;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" }, include: { question: true } },
    },
  });
  if (!assignment) notFound();

  type QuestionItem = (typeof assignment.questions)[number];
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{assignment.title}</h1>
      <PracticeTake
        assignmentId={assignment.id}
        questions={assignment.questions.map((aq: QuestionItem) => ({
          id: aq.question.id,
          content: aq.question.content,
          passage: aq.question.passage,
          options: JSON.parse(aq.question.options) as string[],
          answer: aq.question.answer,
          questionType: aq.question.questionType,
        }))}
        isOnboarding={onboarding === "1"}
      />
    </div>
  );
}
