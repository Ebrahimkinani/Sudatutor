import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { registerSchema } from "@/lib/validators/auth"
import { rateLimit } from "@/lib/rate-limit/limiter"
import { logSecurityEvent, getGenericAuthError, sanitizeEmail } from "@/lib/utils/security"

export async function POST(req: Request) {
    try {
        // 1. Rate Limiting (IP-based)
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
        const { success, remaining, reset } = rateLimit(ip)

        if (!success) {
            logSecurityEvent("rate_limit_exceeded", {
                ip: ip === "unknown" ? "unknown" : "***", // Don't log full IP
                endpoint: "/api/auth/register",
            })

            return NextResponse.json(
                { ok: false, code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                    }
                }
            )
        }

        // 2. Parse and Validate Body
        const body = await req.json()
        const result = registerSchema.safeParse(body)

        if (!result.success) {
            logSecurityEvent("registration_validation_failed", {
                errors: result.error.flatten().fieldErrors,
            })

            return NextResponse.json(
                { ok: false, code: "VALIDATION_ERROR", message: "Invalid input data", errors: result.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password, name } = result.data

        // 3. Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            logSecurityEvent("registration_duplicate_email", {
                email,
            })

            // Generic error to prevent user enumeration
            // But for registration, it's acceptable to say email exists
            return NextResponse.json(
                { ok: false, code: "EMAIL_EXISTS", message: "Email is already registered" },
                { status: 409 }
            )
        }

        // 4. Hash Password (use bcrypt with cost factor 12 for security)
        const passwordHash = await hash(password, 12)

        // 5. Create User
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        })

        logSecurityEvent("registration_success", {
            userId: user.id,
            email: user.email,
        })

        // Return success (excluding sensitive fields)
        return NextResponse.json(
            { ok: true, message: "Account created successfully" },
            {
                status: 201,
                headers: {
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                }
            }
        )

    } catch (error) {
        // Log error securely (sanitized)
        logSecurityEvent("registration_error", {
            error: error instanceof Error ? error.message : "Unknown error",
        })

        // Return generic error to prevent information disclosure
        return NextResponse.json(
            { ok: false, code: "INTERNAL_ERROR", message: "Something went wrong" },
            { status: 500 }
        )
    }
}
