import crypto from "crypto"

/**
 * Security utility functions for the application
 * Following Next.js security best practices
 */

/**
 * Sanitize email for logging - only show domain to prevent data leaks
 * @example sanitizeEmail("user@example.com") => "***@example.com"
 */
export function sanitizeEmail(email: string): string {
    if (!email || !email.includes("@")) return "***"
    const [, domain] = email.split("@")
    return `***@${domain}`
}

/**
 * Sanitize error messages to prevent sensitive data exposure
 * Removes stack traces, file paths, and sensitive details
 */
export function sanitizeError(error: unknown): string {
    if (error instanceof Error) {
        // Remove file paths and line numbers
        const message = error.message.replace(/\/[^\s]+:\d+:\d+/g, "[path]")
        // Remove potential email addresses
        return message.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email]")
    }
    return "An unexpected error occurred"
}

/**
 * Check if the application is running in a secure context
 */
export function isSecureContext(): boolean {
    return (
        process.env.NODE_ENV === "production" ||
        process.env.NEXTAUTH_URL?.startsWith("https://") ||
        false
    )
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
    return crypto.randomBytes(32).toString("hex")
}

/**
 * Validate CSRF token (timing-safe comparison)
 */
export function validateCSRFToken(token1: string, token2: string): boolean {
    if (!token1 || !token2) return false
    if (token1.length !== token2.length) return false

    try {
        const buffer1 = Buffer.from(token1)
        const buffer2 = Buffer.from(token2)
        return crypto.timingSafeEqual(buffer1, buffer2)
    } catch {
        return false
    }
}

/**
 * Sanitize user data before returning to client
 * Removes sensitive fields
 */
export function sanitizeUserData<T extends Record<string, any>>(
    user: T
): Omit<T, "passwordHash" | "password"> {
    const { passwordHash, password, ...safeUser } = user as any
    return safeUser
}

/**
 * Create a generic authentication error message
 * Prevents user enumeration attacks
 */
export function getGenericAuthError(): string {
    return "Invalid credentials. Please check your email and password."
}

/**
 * Log security event (sanitized for production)
 */
export function logSecurityEvent(
    event: string,
    details: Record<string, any> = {}
): void {
    const sanitized = {
        event,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        ...Object.entries(details).reduce((acc, [key, value]) => {
            // Sanitize email addresses
            if (key === "email" && typeof value === "string") {
                acc[key] = sanitizeEmail(value)
            }
            // Never log passwords or tokens
            else if (
                ["password", "token", "secret", "hash"].some((sensitive) =>
                    key.toLowerCase().includes(sensitive)
                )
            ) {
                acc[key] = "[REDACTED]"
            } else {
                acc[key] = value
            }
            return acc
        }, {} as Record<string, any>),
    }

    if (process.env.NODE_ENV === "development") {
        console.log("🔒 Security Event:", sanitized)
    } else {
        // In production, use structured logging
        console.log(JSON.stringify(sanitized))
    }
}
