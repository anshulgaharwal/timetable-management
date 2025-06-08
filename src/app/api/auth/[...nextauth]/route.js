import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { getUserByEmail } from "../../../../lib/user-service"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const user = await getUserByEmail(credentials.email)

          if (!user || !user.password) {
            return null // Invalid credentials
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          return isValid ? user : null
        } catch (error) {
          // Log the error for debugging
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const existingUser = await getUserByEmail(user.email)
        return !!existingUser
      }
      return true
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        // This is the initial sign-in.
        // The user object passed here is the one returned from 'authorize' or the Google profile.
        // We can safely transfer the id and role to the token.
        const dbUser = await getUserByEmail(user.email)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
    signOut: "/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
