import pino from "pino"

// Define log level based on environment
const level = import.meta.env.DEV ? "debug" : "info"

export const logger = pino({
  level,
  browser: {
    asObject: true,
    serialize: true,
  },
  // In development, we use a simpler format for readability
  // In production, we keep JSON for structured logging systems
  transport: import.meta.env.DEV
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      }
    : undefined,
})
