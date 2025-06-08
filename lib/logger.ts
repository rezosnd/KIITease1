import fs from "fs"
import path from "path"

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  meta?: any
  userId?: string
  ip?: string
  userAgent?: string
}

class Logger {
  private logDir: string

  constructor() {
    this.logDir = path.join(process.cwd(), "logs")
    this.ensureLogDirectory()
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private writeLog(entry: LogEntry) {
    const logFile = path.join(this.logDir, `${new Date().toISOString().split("T")[0]}.log`)
    const logLine = JSON.stringify(entry) + "\n"

    // Console output in development
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`[${entry.level}] ${entry.message}`, entry.meta || "")
    }

    // File output in production
    if (process.env.NODE_ENV === "production") {
      try {
        fs.appendFileSync(logFile, logLine)
      } catch (err) {
        // Fallback: log to console if file write fails
        // eslint-disable-next-line no-console
        console.error("[LOGGER ERROR] Failed to write log file:", err)
        // eslint-disable-next-line no-console
        console.log(logLine)
      }
    }
  }

  error(
    message: string,
    meta?: any,
    context?: { userId?: string; ip?: string; userAgent?: string }
  ) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      meta,
      ...context,
    })
  }

  warn(
    message: string,
    meta?: any,
    context?: { userId?: string; ip?: string; userAgent?: string }
  ) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      meta,
      ...context,
    })
  }

  info(
    message: string,
    meta?: any,
    context?: { userId?: string; ip?: string; userAgent?: string }
  ) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      meta,
      ...context,
    })
  }

  debug(
    message: string,
    meta?: any,
    context?: { userId?: string; ip?: string; userAgent?: string }
  ) {
    if (process.env.NODE_ENV === "development") {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        message,
        meta,
        ...context,
      })
    }
  }
}

export const logger = new Logger()
