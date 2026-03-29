import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { role?: string };
  if (user.role !== "TEACHER") redirect("/student");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/teacher" className="font-semibold text-slate-900">
            SAT Prep Pro
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            href="/teacher"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/teacher/classes"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Classes
          </Link>
          <Link
            href="/teacher/assignments"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Assignments
          </Link>
          <Link
            href="/teacher/questions"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Question Bank
          </Link>
          <Link
            href="/teacher/resources"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Resources
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
