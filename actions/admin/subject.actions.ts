"use server";

import { subjectService } from "@/app/api/admin/subjects/subject.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const subjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    classId: z.string().min(1, "Class is required"),
    isActive: z.boolean().optional(),
});

export async function createSubjectAction(formData: FormData) {
    const raw = {
        name: formData.get("name"),
        classId: formData.get("classId"),
        isActive: formData.get("isActive") === "on",
    };

    const validation = subjectSchema.safeParse(raw);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    try {
        await subjectService.createSubject(validation.data);
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (e) {
        return { error: "Failed to create subject" };
    }
}

export async function updateSubjectAction(id: string, formData: FormData) {
    const raw = {
        name: formData.get("name"),
        classId: formData.get("classId"), // We might not allow moving class easily? But UI might have it.
        isActive: formData.get("isActive") === "on",
        // Note: classId usually shouldn't change for a subject but depends on requirement. 
        // If not in form, schema parse will fail if required. 
        // Let's make classId optional for update in schema or logic.
    };

    // For update, we might not need classId if it's hidden.
    // Let's create specific update schema
    const updateSchema = z.object({
        name: z.string().min(1).optional(),
        isActive: z.boolean().optional()
    });

    const updateData: any = {
        name: raw.name,
        isActive: raw.isActive
    };

    const validation = updateSchema.safeParse(updateData);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    try {
        await subjectService.updateSubject(id, validation.data);
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (e) {
        return { error: "Failed to update subject" };
    }
}

export async function deleteSubjectAction(id: string) {
    try {
        await subjectService.deleteSubject(id);
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete subject" };
    }
}
