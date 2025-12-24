"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, Calendar, Trash2 } from "lucide-react"
import { deleteChat } from "@/app/actions/chat"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

type ChatSession = {
    id: string
    title: string
    class: { name: string } | null
    subject: { name: string } | null
    lastMessageAt: Date
    messageCount: number
}

export function HistoryList({ chats }: { chats: ChatSession[] }) {
    const router = useRouter()

    if (chats.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No chat history found.</p>
                <Button asChild variant="link" className="mt-2 text-[#7551a2]">
                    <Link href="/">Start a new chat</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chats.map((chat) => (
                <Card key={chat.id} className="relative group">
                    <Link href={`/chat/${chat.id}`} className="block h-full">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold truncate pr-8 text-[#7551a2]">
                                    {chat.subject?.name || 'Unknown Subject'}
                                </CardTitle>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full whitespace-nowrap">
                                    {chat.class?.name || 'Unknown Class'}
                                </span>
                            </div>
                            <CardDescription className="line-clamp-1 text-xs">
                                {chat.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {chat.messageCount} msgs
                                </div>
                            </div>
                        </CardContent>
                    </Link>

                    <form
                        action={async () => {
                            if (confirm("Delete this chat?")) {
                                await deleteChat(chat.id)
                            }
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </form>
                </Card>
            ))}
        </div>
    )
}
