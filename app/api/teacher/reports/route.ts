import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const format = searchParams.get("format") || "csv";

  const assignments = await prisma.assignment.findMany({
    where: {
      teacherId: session.user.id,
      ...(classId ? { classId } : {}),
    },
    include: {
      submissions: { include: { student: true } },
      class: true,
    },
  });

  if (format === "csv") {
    const rows: string[][] = [
      ["Assignment", "Class", "Student", "Email", "Score", "Total", "Percent", "Completed"],
    ];
    for (const a of assignments) {
      for (const s of a.submissions) {
        const pct = s.totalQuestions
          ? Math.round(((s.score ?? 0) / s.totalQuestions) * 100)
          : 0;
        rows.push([
          a.title,
          a.class?.name ?? "",
          s.student.name ?? "",
          s.student.email,
          String(s.score ?? ""),
          String(s.totalQuestions),
          `${pct}%`,
          new Date(s.completedAt).toISOString(),
        ]);
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=sat-prep-reports.csv",
      },
    });
  }

  return NextResponse.json({ assignments });
}
