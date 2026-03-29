import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboard() {
  const session = await auth();
  const classes = await prisma.class.findMany({
    where: { teacherId: session?.user?.id },
    include: { _count: { select: { enrollments: true, assignments: true } } },
  });
  const recentAssignments = await prisma.assignment.findMany({
    where: { teacherId: session?.user?.id },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-slate-600">Manage your classes and track student progress</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Your active classes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classes.length}</p>
            <Link href="/teacher/classes">
              <Button variant="outline" size="sm" className="mt-2">
                View classes
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Recent assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{recentAssignments.length}</p>
            <Link href="/teacher/assignments">
              <Button variant="outline" size="sm" className="mt-2">
                Create assignment
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Total enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {classes.reduce((sum, c) => sum + c._count.enrollments, 0)}
            </p>
            <a href="/api/teacher/reports?format=csv">
              <Button variant="outline" size="sm" className="mt-2">
                Export reports (CSV)
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your classes</CardTitle>
            <CardDescription>Class roster and invite codes</CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes yet. Create one from the onboarding or{" "}
                <Link href="/teacher/classes" className="text-primary hover:underline">
                  classes page
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-3">
                {classes.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c._count.enrollments} students · {c._count.assignments} assignments
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs">
                        {c.inviteCode}
                      </code>
                      <Link href={`/teacher/classes/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent assignments</CardTitle>
            <CardDescription>Latest created</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No assignments yet. Create one from the{" "}
                <Link href="/teacher/assignments" className="text-primary hover:underline">
                  assignments page
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-3">
                {recentAssignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {a._count.submissions} submissions
                      </p>
                    </div>
                    <Link href={`/teacher/assignments/${a.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
