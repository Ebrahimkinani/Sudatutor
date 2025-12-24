export type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
    level: LogLevel
    message: string
    requestId?: string
    userId?: string
    meta?: Record<string, any>
    timestamp: string
}

class Logger {
    private log(level: LogLevel, message: string, meta?: Record<string, any>) {
        const entry: LogEntry = {
            level,
            message,
            meta,
            timestamp: new Date().toISOString(),
        }

        // In production, you'd send this to Datadog/CloudWatch etc.
        // For now, structured JSON to console is best for serverless.
        console.log(JSON.stringify(entry))
    }

    info(message: string, meta?: Record<string, any>) {
        this.log("info", message, meta)
    }

    warn(message: string, meta?: Record<string, any>) {
        this.log("warn", message, meta)
    }

    error(message: string, meta?: Record<string, any>) {
        this.log("error", message, meta)
    }

    debug(message: string, meta?: Record<string, any>) {
        if (process.env.NODE_ENV === "development") {
            this.log("debug", message, meta)
        }
    }
}

export const logger = new Logger()
