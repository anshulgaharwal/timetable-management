import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
  async signIn({ user, account, profile }) {
  if (account.provider === "google") {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

    if (!existingUser) {
      const selectedRole = typeof window !== 'undefined' ? localStorage.getItem("selectedRole") : null;

      // Fallback if localStorage not available
      const role = selectedRole || "student"; // or redirect to select-role if missing

      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          role: role,
          // no password for Google users
        },
      });
    }
  }

  return true;
},

  async session({ session, token }) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    session.user.id = user.id;
    session.user.role = user.role;
    return session;
  },

  async jwt({ token, account, user }) {
    if (account && user) {
      token.id = user.id;
      token.email = user.email;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      token.role = dbUser?.role ?? null;
    }
    return token;
  }
},
  pages: {
    signIn: "/signin",
    error: "/signin", 
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
