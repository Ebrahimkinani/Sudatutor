export class AppError extends Error {
    public readonly code: string
    public readonly statusCode: number
    public readonly isOperational: boolean

    constructor(message: string, code: string, statusCode = 400) {
        super(message)
        this.code = code
        this.statusCode = statusCode
        this.isOperational = true

        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export const ERROR_CODES = {
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError
}

export function handleSafeError(error: unknown) {
    if (isAppError(error)) {
        return {
            message: error.message,
            code: error.code,
        }
    }

    console.error("Unhandled Error:", error)
    return {
        message: "An unexpected error occurred",
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    }
}
