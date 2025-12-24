"use client"

import * as React from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function Composer() {
    return (
        <div className="sticky bottom-0 bg-background pt-4 pb-6">
            <div className="relative flex items-end gap-2 p-2 border rounded-xl bg-background shadow-sm">
                <div className="flex-1">
                    <Textarea
                        placeholder="Type a message..."
                        className="min-h-[20px] max-h-[200px] w-full resize-none border-0 shadow-none focus-visible:ring-0 p-3"
                        rows={1}
                    />
                </div>
                <div className="flex items-center pb-2 pr-2 gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="h-8 w-8 rounded-full">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>Space to navigate messages</span>
                    <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        anthropic/claude-sonnet-4.5
                    </span>
                </div>
                <div>autonomous</div>
            </div>
        </div>
    )
}
