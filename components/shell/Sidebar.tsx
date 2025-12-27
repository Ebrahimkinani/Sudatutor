
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    PanelLeftClose,
    PanelLeftOpen,
    Settings
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarContent } from "./SidebarContent"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { LogoutButton } from "@/components/common/LogoutButton"
import type { Folder, ChatSession, User } from "@prisma/client"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    folders: Folder[]
    chats: ChatSession[]
    user: User & { image: string | null }
    classes: { id: string; name: string }[]
    subjects: { id: string; name: string; classId: string }[]
}

export function Sidebar({ className, folders, chats, user, classes, subjects }: SidebarProps) {
    const [collapsed, setCollapsed] = React.useState(false)
    const pathname = usePathname()

    return (
        <div className={cn("relative flex flex-col h-full bg-[#f9f9fa] border-r transition-all duration-300", collapsed ? "w-16" : "w-[280px]", className)}>
            {/* Top Section: Profile & Toggle */}
            <div className={cn("flex items-center p-2 h-16 border-b", collapsed ? "justify-center" : "justify-between")}>
                {!collapsed ? (
                    <>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-medium truncate">{user.name || "User"}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                            </div>
                        </div>
                        <Button

                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <PanelLeftOpen className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 py-4">
                <SidebarContent
                    collapsed={collapsed}
                    folders={folders}
                    chats={chats}
                    user={user}
                    classes={classes}
                    subjects={subjects}
                />
            </ScrollArea>

            {/* Footer: Logout */}
            <div className={cn("p-4 border-t mt-auto", collapsed ? "hidden" : "block")}>
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground mb-2",
                        pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    <span>الإعدادات</span>
                </Link>
                <LogoutButton />
            </div>
        </div>
    )
}
