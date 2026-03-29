import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TeacherClassesPage() {
  const session = await auth();
  const classes = await prisma.class.findMany({
    where: { teacherId: session?.user?.id },
    include: { _count: { select: { enrollments: true, assignments: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Classes</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
              <CardDescription>
                {c._count.enrollments} students · {c._count.assignments} assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm">
                Invite code: <code className="rounded bg-slate-100 px-2 py-1">{c.inviteCode}</code>
              </p>
              <Link href={`/teacher/classes/${c.id}`}>
                <Button size="sm">View roster</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {classes.length === 0 && (
        <p className="text-muted-foreground">
          No classes yet. Create one during onboarding or add a class from the dashboard.
        </p>
      )}
    </div>
  );
}
