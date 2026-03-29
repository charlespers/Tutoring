import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
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
      if (isOnAuthPage || isOnboarding) return true;
      if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));

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
};
