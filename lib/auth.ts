import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingComplete: user.onboardingComplete,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "STUDENT";
        token.onboardingComplete = (user as { onboardingComplete?: boolean }).onboardingComplete ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
      const isOnboarding = nextUrl.pathname.startsWith("/onboard");
      const isLanding = nextUrl.pathname === "/";

      if (isLanding) {
        if (isLoggedIn) {
          const user = auth.user as { role?: string; onboardingComplete?: boolean };
          if (!user.onboardingComplete) return Response.redirect(new URL("/onboard", nextUrl));
          if (user.role === "TEACHER") return Response.redirect(new URL("/teacher", nextUrl));
          if (user.role === "STUDENT") return Response.redirect(new URL("/student", nextUrl));
        }
        return true;
      }
      if (isOnAuthPage || isOnboarding) {
        if (isLoggedIn && !nextUrl.pathname.startsWith("/onboard")) {
          const user = auth.user as { role?: string; onboardingComplete?: boolean };
          if (!user.onboardingComplete) {
            return Response.redirect(new URL("/onboard", nextUrl));
          }
          if (user.role === "TEACHER") {
            return Response.redirect(new URL("/teacher", nextUrl));
          }
          if (user.role === "STUDENT") {
            return Response.redirect(new URL("/student", nextUrl));
          }
        }
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      const user = auth.user as { role?: string; onboardingComplete?: boolean };
      if (!user.onboardingComplete && !nextUrl.pathname.startsWith("/onboard")) {
        return Response.redirect(new URL("/onboard", nextUrl));
      }

      const isTeacherRoute = nextUrl.pathname.startsWith("/teacher");
      const isStudentRoute = nextUrl.pathname.startsWith("/student");
      if (isTeacherRoute && user.role !== "TEACHER") {
        return Response.redirect(new URL("/student", nextUrl));
      }
      if (isStudentRoute && user.role !== "STUDENT") {
        return Response.redirect(new URL("/teacher", nextUrl));
      }

      return true;
    },
  },
});
