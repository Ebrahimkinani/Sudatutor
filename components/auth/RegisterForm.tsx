"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { registerSchema, RegisterInput } from "@/lib/validators/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export function RegisterForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterInput) {
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    name: data.name,
                    confirmPassword: data.confirmPassword
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                // Clear password fields on error for security
                const form = document.querySelector("form") as HTMLFormElement
                if (form) {
                    const passwordInputs = form.querySelectorAll('input[type="password"]')
                    passwordInputs.forEach((input) => ((input as HTMLInputElement).value = ""))
                }

                throw new Error(result.message || "فشل التسجيل")
            }

            toast({
                title: "تم إنشاء الحساب!",
                description: "تم التسجيل بنجاح. يرجى تسجيل الدخول.",
            })

            // Redirect to correct sign-in page
            router.push("/auth/sign-in")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "خطأ في التسجيل",
                description: error instanceof Error ? error.message : "حدث خطأ ما",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <Label htmlFor="name">الاسم (اختياري)</Label>
                        <Input
                            id="name"
                            placeholder="الاسم الكامل"
                            type="text"
                            autoCapitalize="words"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...register("name")}
                            className="text-right"
                            dir="rtl"
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...register("email")}
                            className="text-right"
                            dir="rtl"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="**********"
                                type={showPassword ? "text" : "password"}
                                disabled={isLoading}
                                {...register("password")}
                                className="text-right pl-10"
                                dir="rtl"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                    {showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                                </span>
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                placeholder="**********"
                                type={showConfirmPassword ? "text" : "password"}
                                disabled={isLoading}
                                {...register("confirmPassword")}
                                className="text-right pl-10"
                                dir="rtl"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                    {showConfirmPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                                </span>
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        إنشاء حساب
                    </Button>
                </div>
            </form>

        </div>
    )
}
