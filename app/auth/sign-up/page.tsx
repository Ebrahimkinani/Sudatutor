import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { Suspense } from "react"
import { MagneticText } from "@/components/ui/morphing-cursor"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Create an account",
    description: "Create an account to get started.",
}

export default function RegisterPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <MagneticText
                        text="Sudatutor"
                        hoverText="Sudatutor"
                        className="mb-2"
                    />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        إنشاء حساب
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        أدخل بريدك الإلكتروني أدناه لإنشاء حسابك
                    </p>
                </div>
                <RegisterForm />
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link href="/auth/sign-in" className="hover:text-brand underline underline-offset-4">
                        لديك حساب بالفعل؟ تسجيل الدخول
                    </Link>
                </p>
            </div>
        </div>
    )
}
