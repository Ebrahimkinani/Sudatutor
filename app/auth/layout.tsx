import { DottedSurface } from "@/components/ui/dotted-surface"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <DottedSurface />
            {children}
        </>
    )
}

