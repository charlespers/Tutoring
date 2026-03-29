# SAT Prep Pro

A professional Digital SAT tutoring platform with dual student/teacher portals, custom question bank, assignment workflows, and research-backed onboarding.

## Features

- **Student Portal**: Dashboard, Practice Center, Progress tracking, Resources
- **Teacher Portal**: Class roster, Assignment builder, Question bank, Reports, Resources
- **Onboarding**: Role-based flows for teachers (create class, add students, first assignment) and students (join class, diagnostic, first practice)
- **Question Bank**: Digital SAT-aligned questions (Reading & Writing, Math) with domain/skill/difficulty metadata
- **Assignments**: Auto-graded practice, assign to classes or individuals

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Shadcn UI
- NextAuth v5 (Credentials)
- Prisma + SQLite

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
cp .env.example .env
npx prisma migrate dev
npm run db:seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Data

The seed creates:

- System teacher account: `system@satpreppro.com` / `system`
- 8 sample questions across Reading & Writing and Math

## Creating Accounts

1. **Sign up** as Student or Teacher
2. **Teachers**: Complete onboarding (create class, invite students, create assignment)
3. **Students**: Join via invite code or practice on your own

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run db:seed` - Seed database
- `npm run db:studio` - Prisma Studio
