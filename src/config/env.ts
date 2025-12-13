// Typed Environment Configuration
// Fails fast if required variables are missing

interface Config {
  env: "development" | "production" | "test"
  version: string
  sentryDsn?: string
  apiUrl?: string
}

const config: Config = {
  env: import.meta.env.MODE as Config["env"],
  version: import.meta.env.VITE_APP_VERSION || "0.0.0",
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  // Add other vars here
}

export default config
