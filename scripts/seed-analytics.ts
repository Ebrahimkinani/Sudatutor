
import { PrismaClient, Role } from "@prisma/client";
import { subDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding analytics data...");

    // 1. Ensure we have some users
    const userCount = await prisma.user.count();
    if (userCount < 10) {
        console.log("Creating dummy users...");
        for (let i = 0; i < 20; i++) {
            try {
                await prisma.user.create({
                    data: {
                        email: `user${i}@example.com`,
                        passwordHash: "hash",
                        role: i === 0 ? Role.ADMIN : Role.USER,
                        name: `User ${i}`,
                    },
                });
            } catch (e) {
                // ignore unique constraint
            }
        }
    }

    // 2. Generate Daily Stats for last 30 days
    console.log("Generating daily stats...");
    const classes = ["Class 8", "Class 1", "Class 2", "Class 3"];
    const subjects = ["Math", "Physics", "Chemistry", "English"];

    for (let i = 30; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i));

        // Daily User Stats
        const activeUsers = Math.floor(Math.random() * 50) + 10;
        await prisma.dailyUserStats.upsert({
            where: { date },
            update: {},
            create: {
                date,
                totalUsers: 100 + (30 - i) * 2, // growing total
                newUsers: Math.floor(Math.random() * 5),
                activeUsers,
            },
        });

        // Daily Class Stats
        for (const className of classes) {
            await prisma.dailyClassStats.create({
                data: {
                    date,
                    classId: className, // Using name as ID for simplicity in seed
                    activeStudents: Math.floor(Math.random() * 20),
                    chats: Math.floor(Math.random() * 10),
                    messages: Math.floor(Math.random() * 50),
                }
            });
        }

        // Daily Subject Stats
        for (const subject of subjects) {
            await prisma.dailySubjectStats.create({
                data: {
                    date,
                    subjectId: subject, // Using name as ID for simplicity
                    activeStudents: Math.floor(Math.random() * 20),
                    chats: Math.floor(Math.random() * 10),
                    messages: Math.floor(Math.random() * 50),
                }
            });
        }
    }

    console.log("✅ Analytics seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
