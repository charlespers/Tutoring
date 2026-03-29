import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherOnboard } from "@/components/onboard/TeacherOnboard";
import { StudentOnboard } from "@/components/onboard/StudentOnboard";

export default async function OnboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { role?: string; onboardingComplete?: boolean };

  if (user.role === "TEACHER") {
    return <TeacherOnboard />;
  }
  return <StudentOnboard />;
}
