import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

async function main() {
    const uri = process.env.DATABASE_URL
    if (!uri) throw new Error("DATABASE_URL not found")

    const client = new MongoClient(uri)

    try {
        await client.connect()
        console.log("Connected to MongoDB")

        const db = client.db() // Uses db from URI

        // 1. User Indexes
        console.log("Ensuring User indexes...")
        await db.collection("User").createIndex({ email: 1 }, { unique: true })
        await db.collection("User").createIndex({ createdAt: 1 })

        // 2. ChatSession Indexes
        console.log("Ensuring ChatSession indexes...")
        // Stable sorting for "Recent Chats"
        await db.collection("ChatSession").createIndex({ userId: 1, lastMessageAt: -1, id: -1 })
        // Folder filtering
        await db.collection("ChatSession").createIndex({ folderId: 1 })

        // 3. Message Indexes
        console.log("Ensuring Message indexes...")
        // History scrolling
        await db.collection("Message").createIndex({ sessionId: 1, createdAt: 1, id: 1 })

        // 4. TTL Index (Example: Verification Tokens)
        // If you have a VerificationToken collection
        // await db.collection("VerificationToken").createIndex(
        //   { expires: 1 }, 
        //   { expireAfterSeconds: 0 }
        // )

        console.log("✅ All indexes verified/created.")
    } catch (error) {
        console.error("Index creation failed:", error)
    } finally {
        await client.close()
    }
}

main()
