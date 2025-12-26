import { authRepository } from "@/repositories/auth-repository"
import { compare } from "bcryptjs"
import { LoginInput } from "@/lib/validators/auth"
import { logSecurityEvent, sanitizeUserData } from "@/lib/utils/security"

export class AuthService {
    async validateCredentials(credentials: LoginInput) {
        try {
            const user = await authRepository.getUserByEmail(credentials.email)

            if (!user || !user.passwordHash) {
                // Use timing-safe approach - always compare even if user doesn't exist
                // This prevents timing attacks that could reveal if a user exists
                await compare(credentials.password, "$2a$12$invalidhashtopreventtimingattack")

                logSecurityEvent("auth_user_not_found", {
                    email: credentials.email,
                })
                return null // Return null to prevent user enumeration
            }

            const isValid = await compare(credentials.password, user.passwordHash)

            if (!isValid) {
                logSecurityEvent("auth_invalid_password", {
                    email: credentials.email,
                })
                return null
            }

            // Update last login
            await authRepository.updateLastLogin(user.id)

            // Return sanitized user data (no password hash)
            return sanitizeUserData({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            })
        } catch (error) {
            logSecurityEvent("auth_service_error", {
                email: credentials.email,
                error: error instanceof Error ? error.message : "Unknown error",
            })
            return null
        }
    }
}

export const authService = new AuthService()
