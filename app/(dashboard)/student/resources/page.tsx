import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentResourcesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Resources</h1>
      <Card>
        <CardHeader>
          <CardTitle>Study resources</CardTitle>
          <CardDescription>Official and recommended links</CardDescription>
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
    </div>
  );
}
