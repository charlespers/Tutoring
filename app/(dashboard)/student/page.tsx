import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStreak = await prisma.streak.findUnique({
    where: {
      userId_date: { userId: userId ?? "", date: today },
    },
  });

  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId: userId },
    include: { class: true },
  });

  const submissions = await prisma.submission.findMany({
    where: { studentId: userId },
    take: 5,
    orderBy: { completedAt: "desc" },
    include: { assignment: true },
  });

  const pendingAssignments = await prisma.assignment.findMany({
    where: {
      class: {
        enrollments: { some: { studentId: userId } },
      },
    },
    include: {
      _count: { select: { questions: true } },
      submissions: { where: { studentId: userId }, take: 1 },
    },
  });
  type AssignmentWithSubs = (typeof pendingAssignments)[number];
  type SubmissionWithAssignment = (typeof submissions)[number];
  const pending = pendingAssignments.filter((a: AssignmentWithSubs) => a.submissions.length === 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-slate-600">Keep practicing to improve your SAT score</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {todayStreak && todayStreak.count > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s streak</CardTitle>
              <CardDescription>Questions practiced today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{todayStreak.count}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Assignments due</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pending.length}</p>
            <Link href="/student/practice">
              <Button variant="outline" size="sm" className="mt-2">
                View assignments
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Enrolled in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrollments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Total submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{submissions.length}</p>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignments to complete</CardTitle>
            <CardDescription>From your teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {pending.slice(0, 5).map((a: AssignmentWithSubs) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {a._count.questions} questions
                    </p>
                  </div>
                  <Link href={`/student/practice/${a.id}`}>
                    <Button size="sm">Start</Button>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Your latest submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No submissions yet. Start an assignment from the Practice Center.
            </p>
          ) : (
            <ul className="space-y-3">
              {submissions.map((s: SubmissionWithAssignment) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{s.assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.score}/{s.totalQuestions} ·{" "}
                      {new Date(s.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
