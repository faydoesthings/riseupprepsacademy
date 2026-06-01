import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Match portal routes, login, and register
  matcher: ["/portal/:path*", "/login", "/register"],
};
