"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Question = {
  id: string;
  content: string;
  passage: string | null;
  options: string[];
  answer: string;
  questionType: string;
};

export function PracticeTake({
  assignmentId,
  questions,
  isOnboarding = false,
}: {
  assignmentId: string;
  questions: Question[];
  isOnboarding?: boolean;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const q = questions[index];
  const choiceLabels = ["A", "B", "C", "D"];

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  async function handleSubmit() {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        answers,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    setScore(data.score);
    setSubmitted(true);
  }

  if (submitted && score !== null) {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isOnboarding ? "You're on your way!" : "Results"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-bold">
            {score} / {total} correct ({pct}%)
          </p>
          <Button
            onClick={async () => {
              if (isOnboarding) {
                await fetch("/api/auth/complete-onboarding", { method: "POST" });
              }
              router.push("/student");
              router.refresh();
            }}
          >
            {isOnboarding ? "Go to dashboard" : "Back to dashboard"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          Question {index + 1} of {questions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {q.passage && (
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {q.passage}
          </div>
        )}
        <p className="font-medium">{q.content}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const key = choiceLabels[i] || String(i + 1);
            const isSelected = answers[q.id] === key;
            return (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={key}
                  checked={isSelected}
                  onChange={() => handleSelect(key)}
                  className="h-4 w-4"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            Previous
          </Button>
          {index < questions.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Submit</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
