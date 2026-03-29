"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const STEPS = 4;
const STEP_LABELS = [
  "Create your first class",
  "Add students",
  "Create your first assignment",
  "You're all set!",
];

export function TeacherOnboard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          description: classDescription || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setClassId(data.id);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    } finally {
      setLoading(false);
    }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setInviteEmail("");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add student");
    } finally {
      setLoading(false);
    }
  }

  function skipAddStudent() {
    setStep(2);
  }

  async function createAssignment() {
    setLoading(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Welcome Practice",
          classId: classId || undefined,
          questionCount: 5,
        }),
      });
      if (!res.ok) throw new Error("Failed to create assignment");
      setStep(3);
    } catch {
      setError("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    setLoading(true);
    try {
      await fetch("/api/auth/complete-onboarding", { method: "POST" });
      router.push("/teacher");
      router.refresh();
    } catch {
      setError("Failed to complete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4">
            <Progress value={((step + 1) / STEPS) * 100} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Step {step + 1} of {STEPS}
            </p>
          </div>
          <CardTitle>{STEP_LABELS[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "Give your class a name to get started"}
            {step === 1 && "Invite your first student by email (or skip for now)"}
            {step === 2 && "We'll create a quick practice assignment for you"}
            {step === 3 && "Your class is ready! Share the invite link with students"}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={
            step === 0
              ? createClass
              : step === 1
                ? addStudent
                : (e) => {
                    e.preventDefault();
                    if (step === 2) createAssignment();
                    else completeOnboarding();
                  }
          }
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="className">Class name</Label>
                  <Input
                    id="className"
                    placeholder="e.g. Period 3 SAT Prep"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description"
                    value={classDescription}
                    onChange={(e) => setClassDescription(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Student email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@school.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipAddStudent}
                  disabled={loading}
                >
                  Skip for now
                </Button>
              </>
            )}
            {step === 2 && (
              <p className="text-sm text-muted-foreground">
                Click below to create a 5-question practice assignment. You can customize
                assignments later from the dashboard.
              </p>
            )}
            {step === 3 && (
              <p className="text-sm text-muted-foreground">
                You&apos;re all set! Head to your teacher dashboard to manage classes, create
                assignments, and track student progress.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Please wait..."
                : step === 0
                  ? "Create class"
                  : step === 1
                    ? "Add student"
                    : step === 2
                      ? "Create assignment"
                      : "Go to dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
