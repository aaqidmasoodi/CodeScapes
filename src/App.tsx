import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import ScapeEditor from "@/pages/ScapeEditor"
import FlowEditor from "@/pages/FlowEditor"

import { ErrorBoundary } from "@/components/ErrorBoundary"

import ScapeRunnerPage from "@/pages/ScapeRunnerPage"
import AuthCallback from "@/pages/AuthCallback"
import AuthPage from "@/pages/AuthPage"
import CommunityPage from "@/pages/Community"
import ScapeDetailPage from "@/pages/ScapeDetailPage"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/scapes" replace />} />
            <Route path="/dashboard/:tab" element={<Dashboard />} />
            <Route path="/scape/:scapeId" element={<ScapeEditor />} />
            <Route path="/flow/:scapeId" element={<FlowEditor />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Run Routes */}
            {/* /run: Dev Mode (with console) */}
            <Route path="/run/:scapeId" element={<ScapeRunnerPage mode="dev" />} />
            {/* /live: Draft Preview (no console) - "Secret Developer Preview" */}
            <Route path="/live/:scapeId" element={<ScapeRunnerPage mode="live" />} />
            {/* /view: Public Deployment (Frozen Snapshot) - Community Link */}
            <Route path="/view/:scapeId" element={<ScapeRunnerPage mode="published" />} />

            {/* Community Routes */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/scape/:scapeId" element={<ScapeDetailPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
