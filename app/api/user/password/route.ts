import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = changePasswordSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Verify current password
        // Note: Assuming passwordHash is the field name based on schema reading earlier
        if (!user.passwordHash) {
            return new NextResponse("User has no password set (OAuth?)", { status: 400 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValid) {
            return new NextResponse("Incorrect current password", { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                passwordHash: hashedPassword,
            },
        });

        return new NextResponse("Password updated successfully", { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[PASSWORD_UPDATE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
