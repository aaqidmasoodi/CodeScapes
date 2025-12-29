import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertCircle } from "lucide-react"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-4 max-w-md text-center text-muted-foreground">
            The application encountered an unexpected error.
          </p>
          {(import.meta.env.DEV || import.meta.env.VITE_DEBUG === "true") && (
            <div className="w-full max-w-lg overflow-auto rounded-md border bg-muted p-4 font-mono text-xs">
              {this.state.error?.message}
            </div>
          )}
          <button
            className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
