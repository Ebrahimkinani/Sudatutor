import { format } from "date-fns"
import { ChevronRight, Radio, Monitor, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventRowProps {
    role: string
    content: string
    createdAt: Date | string
    meta?: any
}

export function EventRow({ role, content, createdAt, meta }: EventRowProps) {
    // Determine icon based on role or content content
    // "poking around" -> red dot
    // "capturing screen" -> monitor icon

    let Icon = UserIcon
    let iconColor = "text-muted-foreground"

    if (role === 'user') {
        Icon = UserIcon
    } else if (role === 'assistant') {
        Icon = Radio // Placeholder for bot
    } else if (role === 'event') {
        if (content.toLowerCase().includes("poking")) {
            Icon = Radio // Using Radio for "dot" look or custom svg
            iconColor = "text-red-500"
        } else if (content.toLowerCase().includes("capturing")) {
            Icon = Monitor
            iconColor = "text-green-600"
        }
    }

    return (
        <div className="group flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer mb-2">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-md bg-secondary", iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{content}</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                    {format(new Date(createdAt), "MM/dd/yyyy h:mm a")}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
            </div>
        </div>
    )
}
