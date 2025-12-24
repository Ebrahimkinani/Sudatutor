"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CLASSES, SUBJECTS } from "@/lib/config/education"
import { saveContext } from "@/app/actions/context"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button size="lg" type="submit" className="w-full bg-black hover:bg-neutral-800 text-white font-semibold" disabled={pending}>
            {pending ? "جارٍ البدء..." : "محادثة جديدة"}
        </Button>
    )
}

interface HomeContextFormProps {
    defaultClass?: string | null
    defaultSubject?: string | null
    folderId?: string
}

export function HomeContextForm({ defaultClass, defaultSubject, folderId }: HomeContextFormProps) {
    const [error, setError] = useState("")

    return (
        <Card className="w-full max-w-2xl mx-auto border border-black/10 hover:border-black/30 transition-colors">
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold text-black">
                    هيا نتعلم
                </CardTitle>
                <CardDescription>
                    اختر المادة والصف لبدء المحادثة
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    action={async (formData) => {
                        const res = await saveContext({ success: false }, formData)
                        if (!res.success) {
                            setError(res.message || "حدث خطأ ما")
                        }
                    }}
                    className="space-y-6"
                >
                    {folderId && <input type="hidden" name="folderId" value={folderId} />}
                    <div className="space-y-4">
                        <div className="space-y-2 text-center">
                            <label className="text-sm font-medium">الصف / المرحلة</label>
                            <Select name="className" defaultValue={defaultClass || undefined} required>
                                <SelectTrigger className="w-full h-12 text-center justify-center font-medium border-black/20 focus:ring-black">
                                    <SelectValue placeholder="اختر صفك" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLASSES.map((cls) => (
                                        <SelectItem key={cls} value={cls} className="justify-center">
                                            {cls}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 text-center">
                            <label className="text-sm font-medium">المادة</label>
                            <Select name="subjectName" defaultValue={defaultSubject || undefined} required>
                                <SelectTrigger className="w-full h-12 text-center justify-center font-medium border-black/20 focus:ring-black">
                                    <SelectValue placeholder="اختر المادة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUBJECTS.map((sub) => (
                                        <SelectItem key={sub} value={sub} className="justify-center">
                                            {sub}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}
