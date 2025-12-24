import { ArrowLeft, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ChatShell({
    children,
    headerTitle,
    chatId: _chatId // unused
}: {
    children: React.ReactNode
    headerTitle: string
    chatId: string
}) {
    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b z-10 bg-background/95 backdrop-blursupports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full h-10 w-10 hover:bg-accent text-muted-foreground">
                        <Link href="/">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>

                    <div>
                        <h2 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-md">{headerTitle}</h2>
                    </div>
                </div>
                {/* Right side actions - obscured by mobile sidebar on strict mobile, but maybe okay or we hide them */}
                <div className="flex gap-2 mr-8 md:mr-0">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Chat Area */}
            {children}
        </div>
    )
}
