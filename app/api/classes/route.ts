import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }
  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true },
  });
  return NextResponse.json({ classes });
}

async function generateInviteCode(): Promise<string> {
  let code: string;
  let exists: boolean;
  do {
    code = crypto.randomBytes(4).toString("hex").toUpperCase();
    exists = !!(await prisma.class.findUnique({ where: { inviteCode: code } }));
  } while (exists);
  return code;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const inviteCode = await generateInviteCode();
  const cls = await prisma.class.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      inviteCode,
      teacherId: session.user.id,
    },
  });
  return NextResponse.json({ id: cls.id, inviteCode: cls.inviteCode });
}
