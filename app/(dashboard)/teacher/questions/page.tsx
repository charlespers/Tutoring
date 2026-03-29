import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function QuestionBankPage() {
  const session = await auth();
  if (!session?.user) return null;
  const questions = await prisma.question.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const bySection = {
    READING_WRITING: questions.filter((q) => q.section === "READING_WRITING"),
    MATH: questions.filter((q) => q.section === "MATH"),
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Question Bank</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reading & Writing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bySection.READING_WRITING.length}</p>
            <p className="text-sm text-muted-foreground">questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Math</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bySection.MATH.length}</p>
            <p className="text-sm text-muted-foreground">questions</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All questions</CardTitle>
          <CardDescription>Filter by domain, skill, and difficulty when creating assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {questions.slice(0, 20).map((q) => (
              <li key={q.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{q.content.slice(0, 80)}...</p>
                <p className="text-muted-foreground">
                  {q.domain} · {q.difficulty}
                </p>
              </li>
            ))}
          </ul>
          {questions.length > 20 && (
            <p className="mt-2 text-sm text-muted-foreground">
              And {questions.length - 20} more...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
