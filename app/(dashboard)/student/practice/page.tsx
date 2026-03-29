import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PracticeCenterPage() {
  const session = await auth();
  const userId = session?.user?.id;

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
  const pending = pendingAssignments.filter((a: AssignmentWithSubs) => a.submissions.length === 0);

  const systemTeacher = await prisma.user.findUnique({
    where: { email: "system@satpreppro.com" },
  });
  const selfPracticeAssignment = systemTeacher
    ? await prisma.assignment.findFirst({
        where: { teacherId: systemTeacher.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true } } },
      })
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Practice Center</h1>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned to you</CardTitle>
            <CardDescription>From your teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {pending.map((a: AssignmentWithSubs) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a._count.questions} questions</p>
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
          <CardTitle>Practice on your own</CardTitle>
          <CardDescription>Take a quick practice set</CardDescription>
        </CardHeader>
        <CardContent>
          {selfPracticeAssignment ? (
            <Link href={`/student/practice/${selfPracticeAssignment.id}`}>
              <Button>Start practice</Button>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No practice sets available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
