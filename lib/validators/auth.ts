import { z } from "zod"

// Email validation with sanitization
const emailSchema = z
    .string()
    .email("Invalid email address")
    .trim()
    .toLowerCase()
    .max(255, "Email is too long") // Prevent DoS

// Password validation with security requirements
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long") // Prevent DoS
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .optional(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

