import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import ScapeEditor from "@/pages/ScapeEditor"

import { ErrorBoundary } from "@/components/ErrorBoundary"

import ScapeRunnerPage from "@/pages/ScapeRunnerPage"
import AuthCallback from "@/pages/AuthCallback"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/local" replace />} />
            <Route path="/dashboard/:tab" element={<Dashboard />} />
            <Route path="/scape/:scapeId" element={<ScapeEditor />} />
            <Route path="/run/:scapeId" element={<ScapeRunnerPage mode="dev" />} />
            <Route path="/live/:scapeId" element={<ScapeRunnerPage mode="live" />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
