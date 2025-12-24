import { cn } from "@/lib/utils"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface MessageBubbleProps {
    role: "user" | "assistant" | "system"
    content: string
    createdAt?: Date
}

export function MessageBubble({ role, content, createdAt }: MessageBubbleProps) {
    const isUser = role === "user"

    return (
        <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[85%] md:max-w-[75%] px-5 py-3 text-[15px] leading-7",
                    isUser
                        ? "bg-[#f4f4f4] text-gray-900 rounded-2xl rounded-tr-sm"
                        : "bg-transparent text-gray-900 px-0"
                )}
            >
                <div className="whitespace-pre-wrap">{content}</div>
            </div>
        </div>
    )
}
