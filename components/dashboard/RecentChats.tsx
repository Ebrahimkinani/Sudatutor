import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface RecentChat {
    id: string
    title: string
    lastMessageAt: Date
}

interface RecentChatsProps {
    chats: RecentChat[]
}

export function RecentChats({ chats }: RecentChatsProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Recent chats</CardTitle>
                <div className="text-sm text-muted-foreground hover:underline cursor-pointer ml-auto">See all</div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {chats.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent chats.</p>
                    ) : (
                        chats.map((chat) => (
                            <div key={chat.id} className="flex items-center justify-between group">
                                <Link href={`/chat?session=${chat.id}`} className="flex items-center space-x-4 hover:underline">
                                    <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                        {chat.title}
                                    </div>
                                </Link>
                                <div className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
