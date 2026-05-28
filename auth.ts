
import NextAuth          from "next-auth";
import Credentials       from "next-auth/providers/credentials";
import bcrypt            from "bcryptjs";
import { prisma }        from "@/lib/prisma";
import { loginSchema }   from "@/lib/validations/auth";
import type { Role }     from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",   type: "email"    },
        password: { label: "Пароль", type: "password" },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where:  { email: email.toLowerCase() },
          select: {
            id:           true,
            email:        true,
            passwordHash: true,
            role:         true,
            isActive:     true,
            profile: {
              select: {
                firstName: true,
                lastName:  true,
                photoUrl:  true,
              },
            },
          },
        });

        if (!user || !user.isActive) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        await prisma.user.update({
          where: { id: user.id },
          data:  { lastLoginAt: new Date() },
        });

        return {
          id:        user.id,
          email:     user.email,
          role:      user.role,
          firstName: user.profile?.firstName ?? "",
          lastName:  user.profile?.lastName  ?? "",
          photoUrl:  user.profile?.photoUrl  ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id as string;
        token.role      = (user as { role: Role }).role;
        token.firstName = (user as { firstName: string }).firstName;
        token.lastName  = (user as { lastName:  string }).lastName;
        token.photoUrl  = (user as { photoUrl:  string | null }).photoUrl;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id        = token.id        as string;
      session.user.role      = token.role      as Role;
      session.user.firstName = token.firstName as string;
      session.user.lastName  = token.lastName  as string;
      session.user.photoUrl  = token.photoUrl  as string | null;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60,
  },

  secret: process.env.AUTH_SECRET,
});
