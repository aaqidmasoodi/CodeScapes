import { Link } from "react-router-dom"
import { CodeScapeFullLogo } from "@/components/brand/Logo"
import { Github, Twitter, Mail, ExternalLink } from "lucide-react"

const productLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Community", href: "/community" },
  { label: "New Scape", href: "/new" },
]

const resourceLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Getting Started", href: "/docs/getting-started" },
  { label: "Examples", href: "/community" },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com/aaqidmasoodi/CodeScapes" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/codescapes" },
  { icon: Mail, label: "Contact", href: "mailto:hello@codescapes.io" },
]

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-gradient-to-b from-background to-muted/30 dark:border-white/5">
      <div className="px-8 py-16 lg:px-16">
        {/* Main Footer Grid */}
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <CodeScapeFullLogo height={32} className="text-foreground" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The browser-based creative coding playground. Create, visualize, and share interactive
              code.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white/50 text-muted-foreground transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3 lg:justify-items-end">
            {/* Product */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/70 transition-colors hover:text-emerald-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resources
              </h4>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/70 transition-colors hover:text-emerald-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Open Source */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Open Source
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/aaqidmasoodi/CodeScapes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-emerald-500"
                  >
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/aaqidmasoodi/CodeScapes/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-emerald-500"
                  >
                    Report Issue
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/aaqidmasoodi/CodeScapes/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-emerald-500"
                  >
                    License
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 dark:border-white/5 sm:flex-row">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} CodeScapes</span>
            <span className="hidden sm:inline">•</span>
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hidden transition-colors hover:text-foreground sm:inline"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">🇵🇸🍁🇮🇪</div>
        </div>
      </div>
    </footer>
  )
}
