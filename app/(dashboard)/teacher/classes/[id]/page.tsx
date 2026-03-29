import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const cls = await prisma.class.findFirst({
    where: { id, teacherId: session?.user?.id },
    include: {
      enrollments: { include: { student: true } },
      assignments: { include: { _count: { select: { submissions: true } } } },
    },
  });
  if (!cls) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/teacher/classes" className="text-sm text-primary hover:underline">
          &larr; Back to classes
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{cls.name}</h1>
        <p className="text-muted-foreground">
          Invite code: <code className="rounded bg-slate-100 px-2 py-1">{cls.inviteCode}</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students ({cls.enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cls.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
          ) : (
            <ul className="space-y-2">
              {cls.enrollments.map((e) => (
                <li key={e.id} className="flex justify-between rounded border p-2">
                  <span>{e.student.name || e.student.email}</span>
                  <span className="text-muted-foreground">{e.student.email}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {cls.assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments for this class.</p>
          ) : (
            <ul className="space-y-2">
              {cls.assignments.map((a) => (
                <li key={a.id} className="flex justify-between rounded border p-2">
                  <span>{a.title}</span>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{a._count.submissions} submissions</span>
                    <Link href={`/teacher/assignments/${a.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/teacher/assignments/new?classId=${cls.id}`}>
            <Button variant="outline" size="sm" className="mt-4">
              Create assignment
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
