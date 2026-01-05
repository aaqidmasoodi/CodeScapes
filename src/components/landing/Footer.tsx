import { Link } from "react-router-dom"
import { CodeScapeFullLogo } from "@/components/brand/Logo"
import { Github } from "lucide-react"

const footerLinks = [
  { label: "Community", href: "/community" },
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com/aaqidmasoodi/CodeScapes", external: true },
]

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <CodeScapeFullLogo height={28} className="text-foreground" />
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label === "GitHub" && <Github className="h-4 w-4" />}
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CodeScapes. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
