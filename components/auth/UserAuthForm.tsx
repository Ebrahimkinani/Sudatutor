"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { getSession, signIn } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    isRegister?: boolean
}

const userAuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

type FormData = z.infer<typeof userAuthSchema>

export function UserAuthForm({ className, isRegister, ...props }: UserAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userAuthSchema),
    })
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()

    async function onSubmit(data: FormData) {
        setIsLoading(true)

        // TODO: Handle Register logic (POST /api/register) if isRegister
        // For MVP Login:

        if (isRegister) {
            // Mock register or implement actual API
            // Just simulate delay or 'not implemented' for this turn if I didn't make api
            // But user asked for working auth.
            // I need to implement /api/register route first? Or just skip logic?
            // Plan says "Login & Register pages".
            // I'll assume I need to create the user in DB.

            // Call API
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" }
                })
                if (res.ok) {
                    // Sign in after register
                    signIn("credentials", {
                        email: data.email,
                        password: data.password,
                        callbackUrl: "/chat",
                    })
                } else {
                    const errorData = await res.json().catch(() => ({}))
                    toast({
                        variant: "destructive",
                        title: "فشل إنشاء الحساب",
                        description: errorData.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
                    })
                }
            } catch (e) {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
                })
            }
        } else {
            try {
                const signInResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                    callbackUrl: searchParams?.get("from") || "/",
                })

                if (signInResult?.ok && !signInResult.error) {
                    const session = await getSession()
                    if (session?.user?.role === "ADMIN") {
                        router.push("/dashboard")
                    } else {
                        router.push(searchParams?.get("from") || "/")
                    }
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "فشل تسجيل الدخول",
                        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
                    })
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
                })
            }
        }

        setIsLoading(false)
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    {isRegister && (
                        <div className="grid gap-1">
                            <Label className="sr-only" htmlFor="name">
                                الاسم
                            </Label>
                            <Input
                                id="name"
                                placeholder="الاسم الكامل"
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...register("name")}
                                className="text-right"
                                dir="rtl"
                            />
                        </div>
                    )}
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            البريد الإلكتروني
                        </Label>
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
                        {errors?.email && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            كلمة المرور
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="كلمة المرور"
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
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isRegister ? "إنشاء حساب" : "تسجيل الدخول"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
