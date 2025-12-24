import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { registerSchema } from "@/lib/validators/auth"
import { rateLimit } from "@/lib/rate-limit/limiter"

export async function POST(req: Request) {
    try {
        // 1. Rate Limiting (IP-based)
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        const { success } = rateLimit(ip)

        if (!success) {
            return NextResponse.json(
                { ok: false, code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." },
                { status: 429 }
            )
        }

        // 2. Parse and Validate Body
        const body = await req.json()
        const result = registerSchema.safeParse(body)

        if (!result.success) {
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
            // Don't reveal too much, but for registration specific flow, typically we do say email taken.
            // User requirement: "Display success and error popups... email already exists"
            return NextResponse.json(
                { ok: false, code: "EMAIL_EXISTS", message: "Email is already registered" },
                { status: 409 }
            )
        }

        // 4. Hash Password
        const passwordHash = await hash(password, 12)

        // 5. Create User
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        })

        // Return success (excluding sensitive fields)
        return NextResponse.json(
            { ok: true, message: "Account created successfully" },
            { status: 201 }
        )

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { ok: false, code: "INTERNAL_ERROR", message: "Something went wrong" },
            { status: 500 }
        )
    }
}
