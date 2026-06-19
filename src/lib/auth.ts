import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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

        if (!user || user.status !== "ACTIVE") return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        let profileStatus = "ACTIVE";
        if (user.role === "STUDENT") {
          const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { status: true },
          });
          if (!student || student.status !== "ACTIVE") return null;
          profileStatus = student.status;
        } else if (user.role === "TEACHER") {
          const teacher = await prisma.teacher.findUnique({
            where: { userId: user.id },
            select: { status: true },
          });
          if (!teacher || teacher.status !== "ACTIVE") return null;
          profileStatus = teacher.status;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          accountStatus: user.status,
          profileStatus,
        };
      },
    }),
  ],
});
