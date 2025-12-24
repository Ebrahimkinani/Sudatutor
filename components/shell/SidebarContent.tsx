"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    Calendar,
    Puzzle,
    Settings,
    Menu,
    Plus,
    Folder as FolderIcon,
    ChevronRight,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createFolder, deleteFolder } from "@/app/actions/folder"
import { deleteChat } from "@/app/actions/chat"
import type { Folder, ChatSession, User } from "@prisma/client"
import { ContextPickerModal } from "@/components/context/ContextPickerModal"
import { ActionMenu } from "@/components/ui/action-menu"

export const routes = [
    {
        label: "الرئيسية",
        icon: Menu,
        href: "/",
    },

]

interface SidebarContentProps {
    collapsed?: boolean
    onLinkClick?: () => void
    folders: Folder[]
    chats: ChatSession[]
    user: User & { image: string | null }
}

export function SidebarContent({ collapsed = false, onLinkClick, folders = [], chats = [], user }: SidebarContentProps) {
    const pathname = usePathname()
    const [isCreatingFolder, setIsCreatingFolder] = React.useState(false)
    const [newFolderName, setNewFolderName] = React.useState("")
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>([])

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newFolderName.trim()) return

        try {
            await createFolder(
                newFolderName
            )
            setIsCreatingFolder(false)
            setNewFolderName("")
        } catch (error) {
            console.error("Failed to create folder", error)
        }
    }

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        )
    }

    const chatsWithoutFolder = chats.filter(c => !c.folderId)
    const chatsByFolder = folders.map(folder => ({
        ...folder,
        chats: chats
            .filter(c => c.folderId === folder.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }))

    return (
        <div className="grid gap-4 px-1">
            <nav className="grid gap-1">
                {routes.map((route, index) => (
                    <Link
                        key={index}
                        href={route.href}
                        onClick={onLinkClick}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? route.label : undefined}
                    >
                        <route.icon className="h-4 w-4" />
                        {!collapsed && <span>{route.label}</span>}
                    </Link>
                ))}
                {(user as any)?.role === 'ADMIN' && (
                    <Link
                        href="/admin"
                        onClick={onLinkClick}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname.startsWith("/admin") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? "Admin Dashboard" : undefined}
                    >
                        <Shield className="h-4 w-4" />
                        {!collapsed && <span>لوحة الإدارة</span>}
                    </Link>
                )}
            </nav>

            {!collapsed && (
                <>
                    {/* Folders Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-semibold text-muted-foreground">المجلدات</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={() => setIsCreatingFolder(true)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>

                        {isCreatingFolder && (
                            <form onSubmit={handleCreateFolder} className="px-2 space-y-2 mb-2">
                                <Input
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="اسم المجلد..."
                                    className="h-8 text-xs"
                                />
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm" className="h-7 text-xs w-full">حفظ</Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => setIsCreatingFolder(false)}>إلغاء</Button>
                                </div>
                            </form>
                        )}

                        <div className={cn(
                            "space-y-1 pr-1",
                            folders.length === 0 ? "h-5 overflow-hidden" : "h-auto max-h-52 overflow-y-auto"
                        )}>
                            {chatsByFolder.map(folder => (
                                <div key={folder.id} className="space-y-1">
                                    <div className="flex items-center gap-1 min-w-0 px-2 rounded-lg hover:bg-accent hover:text-accent-foreground group">
                                        <button
                                            onClick={() => toggleFolder(folder.id)}
                                            className="flex-1 flex items-center gap-2 py-1.5 text-sm text-muted-foreground min-w-0"
                                        >
                                            <FolderIcon className="h-4 w-4 shrink-0" />
                                            <span className="flex-1 text-right truncate">{folder.name}</span>
                                            <span className="text-xs shrink-0">{folder.chats.length}</span>
                                            <ChevronRight className={cn("h-3 w-3 transition-transform shrink-0", expandedFolders.includes(folder.id) && "rotate-90")} />
                                        </button>
                                        <ActionMenu
                                            itemType="folder"
                                            onDelete={() => deleteFolder(folder.id)}
                                        />
                                    </div>

                                    {expandedFolders.includes(folder.id) && (
                                        <div className="pr-4 space-y-1">
                                            <ContextPickerModal
                                                folderId={folder.id}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-start h-7 text-xs text-muted-foreground"
                                                    >
                                                        <Plus className="h-3 w-3 ml-2" />
                                                        محادثة جديدة
                                                    </Button>
                                                }
                                            />
                                            {folder.chats.map(chat => (
                                                <div
                                                    key={chat.id}
                                                    className={cn(
                                                        "flex items-center gap-1 min-w-0 px-2 rounded-lg hover:bg-accent hover:text-accent-foreground group",
                                                        pathname === `/chat/${chat.id}` ? "bg-accent/50 text-accent-foreground" : ""
                                                    )}
                                                >
                                                    <Link
                                                        href={`/chat/${chat.id}`}
                                                        className={cn(
                                                            "flex-1 block truncate py-1.5 text-xs transition-colors",
                                                            pathname === `/chat/${chat.id}` ? "text-accent-foreground" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {chat.title}
                                                    </Link>
                                                    <ActionMenu
                                                        itemType="chat"
                                                        onDelete={() => deleteChat(chat.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t my-2" />

                    {/* Recent Chats Section */}
                    <div className="space-y-2">
                        <h3 className="px-2 text-xs font-semibold text-muted-foreground text-right">المحادثات الأخيرة</h3>
                        <div className={cn(
                            "space-y-1 pr-1",
                            chatsWithoutFolder.length === 0 ? "h-5 overflow-hidden" : "h-auto max-h-64 overflow-y-auto"
                        )}>
                            {chatsWithoutFolder.map(chat => (
                                <div
                                    key={chat.id}
                                    className={cn(
                                        "flex items-center gap-1 min-w-0 px-2 rounded-lg hover:bg-accent hover:text-accent-foreground group",
                                        pathname === `/chat/${chat.id}` ? "bg-accent text-accent-foreground" : ""
                                    )}
                                >
                                    <Link
                                        href={`/chat/${chat.id}`}
                                        className={cn(
                                            "flex-1 flex items-center gap-2 py-1.5 text-sm min-w-0",
                                            pathname === `/chat/${chat.id}` ? "text-accent-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        <MessageSquare className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Link>
                                    <ActionMenu
                                        itemType="chat"
                                        onDelete={() => deleteChat(chat.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
