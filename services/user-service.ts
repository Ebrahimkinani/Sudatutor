import { userRepository } from "@/repositories/user-repository"
import { AppError, ERROR_CODES } from "@/lib/errors"

export class UserService {
    async getProfile(userId: string) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new AppError("User not found", ERROR_CODES.NOT_FOUND, 404)
        }
        // Return sanitized profile (exclude sensitive fields if any, though repos should select)
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            selectedClass: user.selectedClass,
            selectedSubject: user.selectedSubject
        }
    }

    async getUserContext(userId: string) {
        const context = await userRepository.getContext(userId)
        if (!context) {
            throw new AppError("User not found", ERROR_CODES.NOT_FOUND, 404)
        }
        return context
    }
}

export const userService = new UserService()
