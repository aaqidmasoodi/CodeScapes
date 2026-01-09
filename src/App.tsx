import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import LandingPage from "./pages/LandingPage"
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
import { DocsLayout } from "@/layouts/DocsLayout"
import { DocsPage } from "@/pages/docs/DocsPage"
import ProfilePage from "@/pages/ProfilePage"

import { AdminLayout } from "@/layouts/AdminLayout"
import { AdminDashboard } from "@/pages/admin/AdminDashboard"
import { AdminEditor } from "@/pages/admin/AdminEditor"
import { AdminOverview } from "@/pages/admin/AdminOverview"
import { QueryProvider } from "@/providers/QueryProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/scapes" replace />} />
              <Route path="/dashboard/:tab" element={<Dashboard />} />
              <Route path="/scape/:scapeId" element={<ScapeEditor />} />
              <Route path="/flow/:scapeId" element={<FlowEditor />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
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
              <Route path="/u/:username" element={<ProfilePage />} />

              {/* Docs Routes */}
              <Route path="/docs" element={<Navigate to="/docs/introduction" replace />} />
              <Route
                path="/docs/:slug"
                element={
                  <DocsLayout>
                    <DocsPage />
                  </DocsLayout>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="docs" element={<AdminDashboard />} />
                <Route path="docs/new" element={<AdminEditor />} />
                <Route path="docs/edit/:id" element={<AdminEditor />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  )
}

export default App
