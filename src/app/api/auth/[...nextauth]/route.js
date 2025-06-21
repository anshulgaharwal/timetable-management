import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { getRoleByEmail } from "@/lib/auth-roles";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const role = getRoleByEmail(user.email);
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, image: user.image, role },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
          role,
        },
      });
      return true;
    },
    async session({ session }) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      session.user.role = user.role;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + "/redirect"; // We'll handle role-based redirect client-side
    },
  },
});

export { handler as GET, handler as POST };
