import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssignmentBuilder } from "@/components/teacher/AssignmentBuilder";

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  const assignments = await prisma.assignment.findMany({
    where: { teacherId: session?.user?.id },
    include: {
      class: true,
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <AssignmentBuilder />
      </div>

      <div className="space-y-4">
        {assignments.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {a.class?.name || "Ungrouped"} · {a._count.questions} questions ·{" "}
                {a._count.submissions} submissions
              </p>
            </CardHeader>
            <CardContent>
              <Link href={`/teacher/assignments/${a.id}`}>
                <Button size="sm">View details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {assignments.length === 0 && (
        <p className="text-muted-foreground">No assignments yet. Create one above.</p>
      )}
    </div>
  );
}
