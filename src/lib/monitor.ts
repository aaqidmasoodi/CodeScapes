import * as Sentry from "@sentry/react"
import config from "@/config/env"
import { logger } from "@/lib/logger"

export const initMonitor = () => {
  if (config.sentryDsn) {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.env,
      release: config.version,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
    logger.info("Sentry initialized")
  } else {
    logger.debug("Sentry DSN not found, skipping initialization")
  }
}
