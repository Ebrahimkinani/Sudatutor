import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authService } from "@/services/auth-service"
import { loginSchema } from "@/lib/validators/auth"
import { logSecurityEvent, getGenericAuthError } from "@/lib/utils/security"

// Validate required environment variables on startup
const requiredEnvVars = ["AUTH_SECRET", "NEXTAUTH_SECRET", "DATABASE_URL", "MONGODB_URI"]
const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] &&
        // At least one of AUTH_SECRET or NEXTAUTH_SECRET must be present
        !(varName === "AUTH_SECRET" && process.env.NEXTAUTH_SECRET) &&
        !(varName === "NEXTAUTH_SECRET" && process.env.AUTH_SECRET) &&
        // At least one of DATABASE_URL or MONGODB_URI must be present
        !(varName === "DATABASE_URL" && process.env.MONGODB_URI) &&
        !(varName === "MONGODB_URI" && process.env.DATABASE_URL)
)

if (missingVars.length > 0 && process.env.NODE_ENV === "production") {
    console.error("❌ Missing required environment variables:", missingVars)
}

export const authOptions: NextAuthOptions & { trustHost?: boolean } = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/sign-in",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    // Validate input
                    const parsed = loginSchema.safeParse(credentials)

                    if (!parsed.success) {
                        logSecurityEvent("auth_validation_failed", {
                            errors: parsed.error.flatten().fieldErrors,
                        })
                        return null
                    }

                    // Validate credentials
                    const user = await authService.validateCredentials(parsed.data)

                    if (!user) {
                        logSecurityEvent("auth_failed", {
                            email: parsed.data.email,
                            reason: "invalid_credentials",
                        })
                        return null
                    }

                    logSecurityEvent("auth_success", {
                        userId: user.id,
                        email: user.email,
                    })

                    return user
                } catch (error) {
                    logSecurityEvent("auth_error", {
                        error: error instanceof Error ? error.message : "Unknown error",
                    })
                    return null
                }
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
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    trustHost: true,
    // Security options
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
}

export const handler = NextAuth(authOptions)

