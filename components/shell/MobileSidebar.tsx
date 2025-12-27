"use client"

import { Menu, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SidebarContent } from "./SidebarContent"
import { useState } from "react"
import { LogoutButton } from "@/components/common/LogoutButton"
import type { Folder, ChatSession, User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobileSidebarProps {
    folders: Folder[]
    chats: ChatSession[]
    user: User & { image: string | null }
    classes: { id: string; name: string }[]
    subjects: { id: string; name: string; classId: string }[]
}

export function MobileSidebar({ folders, chats, user, classes, subjects }: MobileSidebarProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] flex flex-col p-0 gap-0 bg-[#f9f9fa]">
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <SheetDescription className="sr-only">Navigation menu for mobile devices</SheetDescription>

                {/* Top Section: Profile */}
                <div className="flex items-center p-2 h-16 border-b">
                    <div className="flex items-center gap-3 overflow-hidden px-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-medium truncate">{user.name || "User"}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <SidebarContent
                        onLinkClick={() => setOpen(false)}
                        folders={folders}
                        chats={chats}
                        user={user}
                        classes={classes}
                        subjects={subjects}
                    />
                </div>

                {/* Footer: Logout */}
                <div className="p-4 border-t mt-auto">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground mb-2",
                            pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        )}
                        onClick={() => setOpen(false)}
                    >
                        <Settings className="h-4 w-4" />
                        <span>الإعدادات</span>
                    </Link>
                    <LogoutButton />
                </div>
            </SheetContent>
        </Sheet>
    )
}
