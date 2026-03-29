import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeacherResourcesPage() {
  const session = await auth();
  const resources = await prisma.resource.findMany({
    where: { teacherId: session?.user?.id },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Resource Library</h1>
      <Card>
        <CardHeader>
          <CardTitle>External links</CardTitle>
          <CardDescription>Curated resources for your students</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.khanacademy.org/test-prep/sat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Khan Academy - Official SAT Practice
              </a>
            </li>
            <li>
              <a
                href="https://satsuite.collegeboard.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                College Board - SAT Suite
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
