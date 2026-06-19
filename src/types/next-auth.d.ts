import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      image?: string | null;
      accountStatus?: string;
      profileStatus?: string;
    };
  }

  interface User {
    role?: string;
    image?: string | null;
    accountStatus?: string;
    profileStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    picture?: string | null;
    accountStatus?: string;
    profileStatus?: string;
  }
}
