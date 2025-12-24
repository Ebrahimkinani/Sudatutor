"use server";

import { classService } from "@/app/api/admin/classes/class.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for validation
const classSchema = z.object({
    name: z.string().min(1, "Name is required"),
    grade: z.string().optional(),
    isActive: z.boolean().optional(),
});

const updateClassSchema = classSchema.partial().and(z.object({ id: z.string() }));

export async function createClassAction(formData: FormData) {
    const raw = {
        name: formData.get("name"),
        grade: formData.get("grade"),
        isActive: formData.get("isActive") === "on",
    };

    const validation = classSchema.safeParse(raw);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    try {
        await classService.createClass(validation.data);
        revalidatePath("/admin/classes");
        return { success: true };
    } catch (e) {
        return { error: "Failed to create class" };
    }
}

export async function updateClassAction(id: string, formData: FormData) {
    const raw = {
        name: formData.get("name"),
        grade: formData.get("grade"),
        isActive: formData.get("isActive") === "on",
    };

    // We manually constructed the object, now validate
    const validation = classSchema.partial().safeParse(raw);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    try {
        await classService.updateClass(id, validation.data);
        revalidatePath("/admin/classes");
        return { success: true };
    } catch (e) {
        return { error: "Failed to update class" };
    }
}

export async function deleteClassAction(id: string) {
    try {
        await classService.deleteClass(id);
        revalidatePath("/admin/classes");
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete class" };
    }
}
