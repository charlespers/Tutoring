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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AssignmentBuilder() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  async function loadClasses() {
    const res = await fetch("/api/classes");
    if (res.ok) {
      const data = await res.json();
      setClasses(data.classes || []);
    }
  }

  function handleOpen() {
    setOpen(true);
    loadClasses();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          classId: classId || undefined,
          questionCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOpen(false);
      setTitle("");
      setClassId("");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={handleOpen}>Create assignment</Button>
    );
  }

  return (
    <Card className="fixed inset-4 z-50 mx-auto max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Create assignment</CardTitle>
          <CardDescription>Add questions from the bank</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </CardHeader>
      <form onSubmit={handleCreate}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 1 Reading Practice"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Class (optional)</Label>
            <Select value={classId} onValueChange={(v) => setClassId(v || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Number of questions</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10) || 5)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
