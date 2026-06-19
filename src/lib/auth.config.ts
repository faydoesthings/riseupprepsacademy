import type { NextAuthConfig } from "next-auth";
import { getDashboardPath, getPortalPrefixForRole } from "@/lib/roles";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          role?: string;
          accountStatus?: string;
          profileStatus?: string;
          image?: string | null;
        };
        token.role = u.role;
        token.id = user.id;
        token.accountStatus = u.accountStatus ?? "ACTIVE";
        token.profileStatus = u.profileStatus ?? "ACTIVE";
        token.picture = user.image ?? null;
      }

      if (trigger === "update" && session) {
        const patch = session as { image?: string | null; name?: string };
        if (patch.image !== undefined) {
          token.picture = patch.image;
        }
        if (patch.name) {
          token.name = patch.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as {
          role?: string;
          id?: string;
          accountStatus?: string;
          profileStatus?: string;
          image?: string | null;
        };
        su.role = token.role as string;
        su.id = token.id as string;
        su.accountStatus = (token.accountStatus as string) ?? "ACTIVE";
        su.profileStatus = (token.profileStatus as string) ?? "ACTIVE";
        su.image = (token.picture as string | null) ?? null;
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
        const user = auth.user as {
          role?: string;
          accountStatus?: string;
          profileStatus?: string;
        };
        const accountStatus = user.accountStatus ?? "ACTIVE";
        const profileStatus = user.profileStatus ?? "ACTIVE";

        if (accountStatus !== "ACTIVE" || profileStatus !== "ACTIVE") {
          return Response.redirect(new URL("/login?error=AccountInactive", nextUrl));
        }

        const role = user.role ?? "";
        if (role === "SUPER_ADMIN") {
          return true;
        }

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
