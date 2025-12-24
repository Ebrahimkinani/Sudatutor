import { authRepository } from "@/repositories/auth-repository"
import { compare } from "bcryptjs"
import { LoginInput } from "@/lib/validation/auth"

export class AuthService {
    async validateCredentials(credentials: LoginInput) {
        const user = await authRepository.getUserByEmail(credentials.email)

        if (!user || !user.passwordHash) {
            return null // Return null to prevent user enumeration
        }

        const isValid = await compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        await authRepository.updateLastLogin(user.id)

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    }
}

export const authService = new AuthService()
