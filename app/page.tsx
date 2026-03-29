import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-900">SAT Prep Pro</h1>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Master the Digital SAT
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            Professional tutoring platform with custom question banks, adaptive practice, and
            real-time progress tracking. Built for teachers and students.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup?role=student">
              <Button size="lg" className="w-full sm:w-auto">
                I&apos;m a Student
              </Button>
            </Link>
            <Link href="/signup?role=teacher">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I&apos;m a Teacher
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Adaptive Practice</h3>
            <p className="mt-2 text-sm text-slate-600">
              Difficulty adjusts to your performance. Foundations, Medium, and Advanced tiers.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Digital SAT Aligned</h3>
            <p className="mt-2 text-sm text-slate-600">
              Reading & Writing and Math sections with official domain structure.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Teacher Dashboard</h3>
            <p className="mt-2 text-sm text-slate-600">
              Assign work, track progress, and export reports to your grade book.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
