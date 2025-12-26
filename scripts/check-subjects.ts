import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSubjects() {
    const subjects = await prisma.subject.findMany({
        where: { isActive: true },
        select: { id: true, name: true, classId: true },
        orderBy: { name: 'asc' }
    })

    console.log('\n📚 All Active Subjects:\n')
    console.log('Total:', subjects.length)
    console.log('\nSubjects:')
    subjects.forEach(s => {
        console.log(`  - ${s.name} (ID: ${s.id}, Class: ${s.classId})`)
    })

    // Check for any duplicates by name
    const nameCount = new Map<string, number>()
    subjects.forEach(s => {
        nameCount.set(s.name, (nameCount.get(s.name) || 0) + 1)
    })

    const duplicateNames = Array.from(nameCount.entries()).filter(([_, count]) => count > 1)

    if (duplicateNames.length > 0) {
        console.log('\n⚠️  Subjects with duplicate names (across different classes):')
        duplicateNames.forEach(([name, count]) => {
            console.log(`  - "${name}": ${count} occurrences`)
        })
    } else {
        console.log('\n✅ No duplicate subject names found')
    }

    await prisma.$disconnect()
}

checkSubjects()
