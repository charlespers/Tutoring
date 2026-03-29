import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const assignment = await prisma.assignment.findFirst({
    where: { id, teacherId: session?.user?.id },
    include: {
      class: true,
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      submissions: { include: { student: true } },
    },
  });
  if (!assignment) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/teacher/assignments" className="text-sm text-primary hover:underline">
          &larr; Back to assignments
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{assignment.title}</h1>
        <p className="text-muted-foreground">
          {assignment.class?.name || "Ungrouped"} · {assignment.questions.length} questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({assignment.submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignment.submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {assignment.submissions.map((s: (typeof assignment.submissions)[number]) => (
                <li key={s.id} className="flex justify-between rounded border p-2">
                  <span>{s.student.name || s.student.email}</span>
                  <span>
                    {s.score}/{s.totalQuestions}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
