"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"
import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { sendMessageAction } from "@/app/actions/chat"
import { useSearchParams } from "next/navigation"

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 bg-[#7551a2] hover:bg-[#64448c] text-white rounded-xl shadow-sm"
            disabled={pending || disabled}
        >
            <SendHorizontal className="w-5 h-5" />
        </Button>
    )
}

export function ChatComposer({ chatId }: { chatId: string }) {
    const [input, setInput] = useState("")
    const formRef = useRef<HTMLFormElement>(null)
    const searchParams = useSearchParams()
    const folderId = searchParams.get("folderId")

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (input.trim()) {
                formRef.current?.requestSubmit()
            }
        }
    }

    return (
        <div className="p-4 bg-white/50 backdrop-blur-sm border-t">
            <div className="max-w-3xl mx-auto">
                <form
                    ref={formRef}
                    action={sendMessageAction}
                    onSubmit={() => setInput("")}
                    className="flex items-end gap-3 bg-white p-2 rounded-2xl border shadow-sm focus-within:ring-2 focus-within:ring-[#7551a2]/20 transition-all"
                >
                    <input type="hidden" name="chatId" value={chatId} />
                    {chatId === "new" && folderId && (
                        <input type="hidden" name="folderId" value={folderId} />
                    )}
                    <Textarea
                        name="content"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className="min-h-[20px] max-h-[120px] w-full resize-none border-0 p-3 shadow-none focus-visible:ring-0 bg-transparent text-base"
                        rows={1}
                    />
                    <SubmitButton disabled={!input.trim()} />
                </form>
                <div className="text-center text-xs text-muted-foreground mt-3">
                    AI may display inaccurate info, please double check important facts.
                </div>
            </div>
        </div>
    )
}
