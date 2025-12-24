"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, MessageSquare, UserPlus, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/classes", label: "Classes", icon: Users },
        { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
        { href: "/admin/chats", label: "Chats", icon: MessageSquare },
        { href: "/admin/create-admin", label: "Create Admin", icon: UserPlus },
    ];

    return (
        <div className="flex flex-col w-64 border-r h-screen bg-card">
            <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight">Admin Dashboard</h2>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
            {/* Footer */}
            <div className="p-4 border-t mt-auto">
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
