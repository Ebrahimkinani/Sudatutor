"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { saveContext } from "@/app/actions/context"
import { useFormStatus } from "react-dom"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
    classes: { id: string; name: string }[]
    subjects: { id: string; name: string; classId: string }[]
}

export function HomeContextForm({ defaultClass, defaultSubject, folderId, classes, subjects }: HomeContextFormProps) {
    const [error, setError] = useState("")
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

    // Initialize selectedClassId based on defaultClass
    useEffect(() => {
        if (defaultClass && classes.length > 0) {
            const defaultClassObj = classes.find(c => c.name === defaultClass)
            if (defaultClassObj) {
                setSelectedClassId(defaultClassObj.id)
            }
        }
    }, [defaultClass, classes])

    // Filter subjects based on selected class
    const filteredSubjects = useMemo(() => {
        if (!selectedClassId) return subjects
        return subjects.filter(sub => sub.classId === selectedClassId)
    }, [selectedClassId, subjects])

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
                            <Select
                                name="className"
                                defaultValue={defaultClass || undefined}
                                required
                                onValueChange={(value) => {
                                    const selectedClass = classes.find(c => c.name === value)
                                    setSelectedClassId(selectedClass?.id || null)
                                }}
                            >
                                <SelectTrigger className="w-full h-12 text-center justify-center font-medium border-black/20 focus:ring-black">
                                    <SelectValue placeholder="اختر صفك" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.name} className="justify-center">
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 text-center">
                            <label className="text-sm font-medium">المادة</label>
                            <Select
                                name="subjectId"
                                defaultValue={defaultSubject ? filteredSubjects.find(s => s.name === defaultSubject)?.id : undefined}
                                required
                                disabled={!selectedClassId}
                            >
                                <SelectTrigger className="w-full h-12 text-center justify-center font-medium border-black/20 focus:ring-black">
                                    <SelectValue placeholder={selectedClassId ? "اختر المادة" : "اختر الصف أولاً"} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {filteredSubjects.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.id} className="justify-center">
                                            {sub.name}
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
