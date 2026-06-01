import type { NextAuthConfig } from "next-auth";
import { getDashboardPath, getPortalPrefixForRole } from "@/lib/roles";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPortal = nextUrl.pathname.startsWith("/portal");
      const isOnLogin = nextUrl.pathname === "/login";
      const isOnRegister = nextUrl.pathname === "/register";

      if (isOnPortal && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isOnPortal && isLoggedIn) {
        const role = (auth.user as { role?: string }).role ?? "";
        const allowedPrefix = getPortalPrefixForRole(role);
        if (
          !nextUrl.pathname.startsWith(allowedPrefix) &&
          nextUrl.pathname !== "/portal"
        ) {
          return Response.redirect(new URL(getDashboardPath(role), nextUrl));
        }
      }

      if ((isOnLogin || isOnRegister) && isLoggedIn) {
        const role = (auth.user as { role?: string }).role;
        const dashboardPath = getDashboardPath(role ?? "");
        return Response.redirect(new URL(dashboardPath, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export { getDashboardPath } from "@/lib/roles";
