"use client"

import { MessageBubble } from "./MessageBubble"
import { useEffect, useRef, useLayoutEffect } from "react"
import { Loader2 } from "lucide-react"

export type Message = {
    id: string
    role: string
    content: string
    createdAt: Date
}

export function MessageList({ messages }: { messages: Message[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const isInitialLoad = useRef(true)

    useLayoutEffect(() => {
        const container = scrollRef.current
        if (container) {
            if (isInitialLoad.current) {
                container.scrollTop = container.scrollHeight
                isInitialLoad.current = false
            } else {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: "smooth"
                })
            }
        }
    }, [messages])

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-4 max-w-4xl mx-auto">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground opacity-50">
                        <p>Start the conversation...</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        role={msg.role as "system" | "user" | "assistant"}
                        content={msg.content}
                        createdAt={msg.createdAt}
                    />
                ))}
            </div>
        </div>
    )
}
