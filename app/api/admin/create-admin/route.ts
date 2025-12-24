import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { registerSchema } from "@/lib/validators/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

export async function POST(req: Request) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { ok: false, code: "UNAUTHORIZED", message: "You must be logged in" },
                { status: 401 }
            )
        }

        // 2. Check admin privileges
        const adminRecord = await prisma.admin.findUnique({
            where: { userId: session.user.id }
        })

        if (!adminRecord) {
            return NextResponse.json(
                { ok: false, code: "FORBIDDEN", message: "Only admins can create admin users" },
                { status: 403 }
            )
        }

        // 3. Parse and validate request body
        const body = await req.json()
        const result = registerSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { ok: false, code: "VALIDATION_ERROR", message: "Invalid input data", errors: result.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password, name } = result.data

        // 4. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { ok: false, code: "EMAIL_EXISTS", message: "Email is already registered" },
                { status: 409 }
            )
        }

        // 5. Hash password
        const passwordHash = await hash(password, 12)

        // 6. Create user with ADMIN role
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: "ADMIN", // Set role to ADMIN
            },
        })

        // 7. Create Admin table entry
        await prisma.admin.create({
            data: {
                userId: newUser.id,
                role: "admin",
            },
        })

        // 8. Return success response
        return NextResponse.json(
            {
                ok: true,
                message: "Admin user created successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                },
            },
            { status: 201 }
        )

    } catch (error) {
        console.error("Create admin error:", error)
        return NextResponse.json(
            { ok: false, code: "INTERNAL_ERROR", message: "Something went wrong" },
            { status: 500 }
        )
    }
}
