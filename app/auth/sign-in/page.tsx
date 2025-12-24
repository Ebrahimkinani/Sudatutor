import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "@/components/auth/UserAuthForm"
import { Suspense } from "react"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { MagneticText } from "@/components/ui/morphing-cursor"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your account",
}

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4">
            <DottedSurface />
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <MagneticText
                        text="Sudatutor"
                        hoverText="Sudatutor"
                        className="mb-2"
                    />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        مرحباً بعودتك
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        أدخل بريدك الإلكتروني لتسجيل الدخول إلى حسابك
                    </p>
                </div>
                <Suspense fallback={<div>جاري التحميل...</div>}>
                    <UserAuthForm />
                </Suspense>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link href="/register" className="hover:text-brand underline underline-offset-4">
                        ليس لديك حساب؟ اشترك الآن
                    </Link>
                </p>
            </div>
        </div>
    )
}
