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
  "Join a class",
  "Optional diagnostic",
  "Start your first practice",
  "You're on your way!",
];

export function StudentOnboard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function joinClass(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid invite code");
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join class");
    } finally {
      setLoading(false);
    }
  }

  function skipDiagnostic() {
    setStep(2);
  }

  async function startPractice() {
    setLoading(true);
    try {
      const res = await fetch("/api/assignments/start-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/student/practice/${data.assignmentId}?onboarding=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start practice");
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    setLoading(true);
    try {
      await fetch("/api/auth/complete-onboarding", { method: "POST" });
      router.push("/student");
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
            {step === 0 && "Enter the invite code from your teacher to join their class"}
            {step === 1 && "Take a short diagnostic to set your baseline (or skip)"}
            {step === 2 && "We'll give you a quick practice set to get started"}
            {step === 3 && "Your first practice is done! Keep going from your dashboard"}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={
            step === 0
              ? joinClass
              : (e) => {
                  e.preventDefault();
                  if (step === 1) skipDiagnostic();
                  else if (step === 2) startPractice();
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
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite code</Label>
                <Input
                  id="inviteCode"
                  placeholder="e.g. ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have a code?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      setInviteCode("");
                      setStep(1);
                    }}
                  >
                    Practice on my own
                  </Button>
                </p>
              </div>
            )}
            {step === 1 && (
              <>
                <p className="text-sm text-muted-foreground">
                  A 5-question diagnostic helps us recommend the right practice for you.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipDiagnostic}
                  disabled={loading}
                >
                  Skip diagnostic
                </Button>
              </>
            )}
            {step === 2 && (
              <p className="text-sm text-muted-foreground">
                Click below to start a 5-question practice. We&apos;ll show you the results
                right away.
              </p>
            )}
            {step === 3 && (
              <p className="text-sm text-muted-foreground">
                Great job! Head to your dashboard to see assignments, track your progress,
                and keep practicing.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Please wait..."
                : step === 0
                  ? "Join class"
                  : step === 1
                    ? "Start diagnostic"
                    : step === 2
                      ? "Start practice"
                      : "Go to dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
