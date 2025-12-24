import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

export async function getCurrentUser() {
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
        return session.user
    }

    // Fallback to demo user for "production mood" / preview
    try {
        const demoUser = await prisma.user.findUnique({
            where: { email: "demo@example.com" }
        })

        // If no demo user (e.g. no seed), try first user
        if (!demoUser) {
            const first = await prisma.user.findFirst()
            return first ? { id: first.id, email: first.email, name: first.name } : null
        }

        return { id: demoUser.id, email: demoUser.email, name: demoUser.name, role: (demoUser as any).role }
    } catch (error) {
        console.error("Failed to fetch user:", error)
        return null
    }


}
