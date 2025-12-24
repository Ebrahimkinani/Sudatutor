import { prisma } from "@/lib/db/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import * as z from "zod"

const userAuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const json = await req.json()
        const body = userAuthSchema.parse(json)

        const exists = await prisma.user.findUnique({
            where: { email: body.email },
        })

        if (exists) {
            return new NextResponse("User already exists", { status: 409 })
        }

        const passwordHash = await hash(body.password, 12)

        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                passwordHash,
            },
        })

        const { passwordHash: _, ...result } = user

        return NextResponse.json(result)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }
        return new NextResponse(null, { status: 500 })
    }
}
