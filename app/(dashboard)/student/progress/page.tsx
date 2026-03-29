import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentProgressPage() {
  const session = await auth();
  const submissions = await prisma.submission.findMany({
    where: { studentId: session?.user?.id },
    orderBy: { completedAt: "desc" },
    take: 20,
    include: { assignment: true },
  });

  const avgScore =
    submissions.length > 0
      ? submissions.reduce(
          (sum: number, s: (typeof submissions)[number]) =>
            sum + (s.score ?? 0) / s.totalQuestions,
          0
        ) / submissions.length
      : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Progress</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average score</CardTitle>
            <CardDescription>Across all submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(avgScore * 100)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total practice</CardTitle>
            <CardDescription>Completed assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{submissions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {submissions.map((s: (typeof submissions)[number]) => (
                <li key={s.id} className="flex justify-between rounded border p-2">
                  <span>{s.assignment.title}</span>
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
