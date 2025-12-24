
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: "demo@example.com" },
    })
    console.log("User Role:", user?.role)

    const admin = await prisma.admin.findUnique({
        where: { userId: user?.id }
    })
    console.log("Admin Record:", admin)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
