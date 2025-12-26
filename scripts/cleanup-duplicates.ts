import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateSubjects() {
    console.log('🔍 Searching for duplicate subjects...\n')

    // Get all subjects
    const allSubjects = await prisma.subject.findMany({
        orderBy: { createdAt: 'asc' }
    })

    // Group subjects by classId and name
    const subjectGroups = new Map<string, typeof allSubjects>()

    for (const subject of allSubjects) {
        const key = `${subject.classId}:${subject.name}`
        if (!subjectGroups.has(key)) {
            subjectGroups.set(key, [])
        }
        subjectGroups.get(key)!.push(subject)
    }

    // Find duplicates
    const duplicateGroups = Array.from(subjectGroups.entries())
        .filter(([_, subjects]) => subjects.length > 1)

    if (duplicateGroups.length === 0) {
        console.log('✅ No duplicate subjects found!')
        return
    }

    console.log(`Found ${duplicateGroups.length} duplicate subject groups:\n`)

    for (const [key, subjects] of duplicateGroups) {
        const [classId, name] = key.split(':')
        console.log(`📚 Subject: "${name}" (Class ID: ${classId})`)
        console.log(`   Found ${subjects.length} duplicates:`)
        subjects.forEach((s, i) => {
            console.log(`   ${i + 1}. ID: ${s.id}, Created: ${s.createdAt.toISOString()}`)
        })
        console.log()
    }

    console.log('🧹 Starting cleanup process...\n')

    let totalDeleted = 0

    for (const [key, subjects] of duplicateGroups) {
        // Keep the oldest subject (first in the sorted array)
        const [keepSubject, ...duplicates] = subjects
        const duplicateIds = duplicates.map(s => s.id)

        console.log(`Keeping subject ID: ${keepSubject.id} (${keepSubject.name})`)
        console.log(`Deleting ${duplicates.length} duplicate(s)...`)

        // Update all chat sessions that reference the duplicates to point to the kept subject
        for (const duplicateId of duplicateIds) {
            const updateResult = await prisma.chatSession.updateMany({
                where: { subjectId: duplicateId },
                data: { subjectId: keepSubject.id }
            })

            if (updateResult.count > 0) {
                console.log(`  ↳ Updated ${updateResult.count} chat session(s) from ${duplicateId} to ${keepSubject.id}`)
            }
        }

        // Delete the duplicate subjects
        const deleteResult = await prisma.subject.deleteMany({
            where: {
                id: { in: duplicateIds }
            }
        })

        console.log(`  ↳ Deleted ${deleteResult.count} duplicate subject(s)\n`)
        totalDeleted += deleteResult.count
    }

    console.log(`✅ Cleanup complete! Deleted ${totalDeleted} duplicate subject(s).\n`)
}

async function main() {
    try {
        await cleanupDuplicateSubjects()
    } catch (error) {
        console.error('❌ Error during cleanup:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
