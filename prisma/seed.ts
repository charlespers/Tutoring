import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const systemPassword = await bcrypt.hash("system", 10);
  const systemTeacher = await prisma.user.upsert({
    where: { email: "system@satpreppro.com" },
    update: {},
    create: {
      email: "system@satpreppro.com",
      passwordHash: systemPassword,
      name: "System",
      role: "TEACHER",
      onboardingComplete: true,
    },
  });

  const sampleQuestions = [
    {
      section: "READING_WRITING",
      domain: "Information and Ideas",
      skill: "Central Ideas",
      difficulty: "FOUNDATIONS",
      content: "What is the main idea of the passage?",
      passage: "The sunflower is one of the most recognizable flowers in the world. Native to North America, it was domesticated around 3000 BCE. Sunflowers turn their heads to follow the sun across the sky, a behavior known as heliotropism.",
      options: JSON.stringify(["A) Sunflowers are native to Europe", "B) Sunflowers follow the sun", "C) Sunflowers were domesticated recently", "D) Sunflowers are not well known"]),
      answer: "B",
      explanation: "The passage states that sunflowers 'turn their heads to follow the sun across the sky.'",
      questionType: "multiple_choice",
    },
    {
      section: "READING_WRITING",
      domain: "Craft and Structure",
      skill: "Word Choice",
      difficulty: "MEDIUM",
      content: "As used in the passage, 'heliotropism' most nearly means",
      passage: "Young sunflowers exhibit heliotropism, tracking the sun from east to west during the day. As they mature, they settle facing east.",
      options: JSON.stringify(["A) growth toward light", "B) resistance to heat", "C) seasonal flowering", "D) seed production"]),
      answer: "A",
      explanation: "Heliotropism refers to the movement or growth toward the sun/light.",
      questionType: "multiple_choice",
    },
    {
      section: "MATH",
      domain: "Algebra",
      skill: "Linear equations",
      difficulty: "FOUNDATIONS",
      content: "If 2x + 5 = 15, what is the value of x?",
      passage: null,
      options: JSON.stringify(["A) 5", "B) 10", "C) 7", "D) 3"]),
      answer: "A",
      explanation: "2x + 5 = 15 → 2x = 10 → x = 5",
      questionType: "multiple_choice",
    },
    {
      section: "MATH",
      domain: "Algebra",
      skill: "Linear equations",
      difficulty: "MEDIUM",
      content: "For what value of k does the equation 3x + k = 12 have a solution of x = 4?",
      passage: null,
      options: JSON.stringify(["A) 0", "B) 3", "C) 4", "D) 9"]),
      answer: "A",
      explanation: "3(4) + k = 12 → 12 + k = 12 → k = 0",
      questionType: "multiple_choice",
    },
    {
      section: "MATH",
      domain: "Problem-Solving and Data Analysis",
      skill: "Rates",
      difficulty: "FOUNDATIONS",
      content: "A car travels 120 miles in 2 hours. What is its average speed in miles per hour?",
      passage: null,
      options: JSON.stringify(["A) 40", "B) 60", "C) 80", "D) 100"]),
      answer: "B",
      explanation: "Speed = distance / time = 120 / 2 = 60 mph",
      questionType: "multiple_choice",
    },
    {
      section: "READING_WRITING",
      domain: "Standard English Conventions",
      skill: "Punctuation",
      difficulty: "FOUNDATIONS",
      content: "Which choice correctly completes the sentence? The student, ____ had studied for weeks, passed the test.",
      passage: null,
      options: JSON.stringify(["A) whom", "B) who", "C) which", "D) whose"]),
      answer: "B",
      explanation: "'Who' is correct as the subject of the clause 'had studied for weeks.'",
      questionType: "multiple_choice",
    },
    {
      section: "MATH",
      domain: "Advanced Math",
      skill: "Quadratics",
      difficulty: "MEDIUM",
      content: "What are the solutions to x² - 5x + 6 = 0?",
      passage: null,
      options: JSON.stringify(["A) x = 2 and x = 3", "B) x = 1 and x = 6", "C) x = -2 and x = -3", "D) x = 0 and x = 5"]),
      answer: "A",
      explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3",
      questionType: "multiple_choice",
    },
    {
      section: "READING_WRITING",
      domain: "Expression of Ideas",
      skill: "Transitions",
      difficulty: "MEDIUM",
      content: "Which choice best introduces the paragraph? ____. The first smartphones appeared in the 1990s.",
      passage: null,
      options: JSON.stringify(["A) Smartphones are expensive", "B) Mobile phones have evolved significantly over decades", "C) Everyone has a phone today", "D) Phones can make calls"]),
      answer: "B",
      explanation: "This transition introduces the historical development that the next sentence describes.",
      questionType: "multiple_choice",
    },
  ];

  const existingCount = await prisma.question.count();
  if (existingCount === 0) {
    for (const q of sampleQuestions) {
      await prisma.question.create({
        data: {
          ...q,
          createdById: systemTeacher.id,
        },
      });
    }
  }

  const count = await prisma.question.count();
  console.log(`Seeded ${count} questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
