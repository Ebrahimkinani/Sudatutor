/**
 * Verification Script for Pagination Stability
 * Run with: npx tsx scripts/verify-pagination.ts
 */
import { chatRepository } from "../repositories/chat-repository"
import { prisma } from "../lib/db/prisma"

async function verify() {
    console.log("🔍 Verifying Pagination Stability...")

    // Mock User
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log("⚠️ No users found. Skipping test.")
        return
    }

    // 1. Check Session Pagination
    console.log(`Checking sessions for user ${user.id}...`)
    const page1 = await chatRepository.listSessions(user.id, 5)
    console.log(`Page 1 items: ${page1.length}`)

    if (page1.length > 0) {
        const lastSession = page1[page1.length - 1]
        console.log(`Cursor: ${lastSession.id}`)

        const page2 = await chatRepository.listSessions(user.id, 5, lastSession.id)
        console.log(`Page 2 items: ${page2.length}`)

        // Integrity check
        const allIds = new Set([...page1.map(s => s.id), ...page2.map(s => s.id)])
        console.log(`Total unique items: ${allIds.size}`)

        if (allIds.size !== page1.length + page2.length) {
            console.error("❌ FAILURE: Duplicates detected in pagination!")
        } else {
            console.log("✅ SUCCESS: No duplicates in cursor pagination.")
        }
    }

    console.log("Done.")
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
