import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Remove p-8 here if pages have their own padding, but generally standardizing padding here is good. 
                    However, the pages I built have 'p-8 pt-6'. 
                    If I add p-8 here, I get double padding.
                    Let's NOT add padding here, let pages handle it, or check dashboard layout.
                    Dashboard layout had: <div className="p-8">{children}</div>.
                    My pages have: <div className="flex-1 space-y-4 p-8 pt-6">. 
                    So double padding effectively. 
                    I should remove padding from layout or pages. 
                    Let's keep layout clean (no padding) because pages define it.
                */}
                {children}
            </main>
        </div>
    );
}
