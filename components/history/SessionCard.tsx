import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { MessageSquare, Calendar } from "lucide-react"
import Link from "next/link"

interface SessionCardProps {
    id: string
    title: string
    lastMessageAt: Date | string
    messageCount: number
}

export function SessionCard({ id, title, lastMessageAt, messageCount }: SessionCardProps) {
    return (
        <Link href={`/chat?session=${id}`}>
            <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium leading-none">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(lastMessageAt), "MM/dd/yyyy h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            <span>{messageCount} messages</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
