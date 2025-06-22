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

          // Return user with role and id included directly
          return isValid
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
              }
            : null
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
      // Transfer data from token to session without additional DB queries
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },

    async jwt({ token, user }) {
      // Only set these values when the user first signs in
      if (user) {
        // No need to query the database again, user object already has what we need
        token.id = user.id
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
