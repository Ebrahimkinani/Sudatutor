import { PrismaClient, Role } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await hash("password123", 12)

    // 1. Create Class and Subject first
    // We use upsert to avoid duplicates if running seed multiple times
    // Since name is not unique, we findFirst then create if not found, or just create fresh if we don't care about duplicates (but better to be clean).

    let classRecord = await prisma.class.findFirst({ where: { name: "Class 12" } })
    if (!classRecord) {
        classRecord = await prisma.class.create({
            data: { name: "Class 12" }
        })
    }

    let subjectRecord = await prisma.subject.findFirst({
        where: { name: "Computer Science", classId: classRecord.id }
    })
    if (!subjectRecord) {
        subjectRecord = await prisma.subject.create({
            data: {
                name: "Computer Science",
                classId: classRecord.id
            }
        })
    }

    // 2. Create User and Admin
    const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {
            role: Role.ADMIN,
        },
        create: {
            email: "demo@example.com",
            name: "Demo Student",
            passwordHash,
            role: Role.ADMIN,
            selectedClass: classRecord.name,
            selectedSubject: subjectRecord.name,
            admin: {
                create: {
                    role: "admin"
                }
            },
            sessions: {
                create: [
                    {
                        title: "Qatar web developer jobs",
                        classId: classRecord.id,
                        subjectId: subjectRecord.id,
                        className: classRecord.name,
                        subjectName: subjectRecord.name,
                        messageCount: 225,
                        lastMessageAt: new Date("2025-12-20T23:00:00"),
                        messages: {
                            create: [
                                { role: "user", content: "Show me web dev jobs in Qatar" },
                                { role: "assistant", content: "Here are some recent listings..." },
                                { role: "event", content: "poking around..", meta: { type: "action" } }
                            ]
                        }
                    }
                ]
            }
        },
    })

    // Ensure admin record exists if user already existed but admin didn't
    if (user) {
        await prisma.admin.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                role: "admin"
            }
        })
    }

    console.log({ user, class: classRecord, subject: subjectRecord })
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

