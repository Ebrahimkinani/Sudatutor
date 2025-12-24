import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma" // Adapter still needs direct prisma or we wrap adapter too, but for now Adapter is fine.
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authService } from "@/services/auth-service"
import { loginSchema } from "@/lib/validation/auth"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)

                if (!parsed.success) {
                    return null
                }

                return await authService.validateCredentials(parsed.data)
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-ignore - user is typed as AdapterUser | User, but our service returns role
                token.role = user.role
            }
            return token
        },
    },
}

export const handler = NextAuth(authOptions)
