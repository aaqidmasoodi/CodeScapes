import { SeoHead } from "@/components/common/SeoHead"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/landing/Footer"
import { ParticleNetwork } from "@/components/landing/ParticleNetwork"
import { HeroCard } from "@/components/landing/cards/HeroCard"
import { TaglineCard } from "@/components/landing/cards/TaglineCard"
import { FeatureCard } from "@/components/landing/cards/FeatureCard"
import { CTACard } from "@/components/landing/cards/CTACard"
import { ScapeCard } from "@/components/landing/cards/ScapeCard"
import { SectionCard } from "@/components/landing/cards/SectionCard"
import { ScapperShowcase } from "@/components/landing/ScapperShowcase"
import { Code2, Globe, Palette, Blocks, Moon, Zap } from "lucide-react"

const features = [
  { icon: Palette, title: "Creative Coding", description: "p5.js, Three.js, vanilla JS" },
  { icon: Code2, title: "Python in Browser", description: "Pyodide-powered turtle graphics" },
  { icon: Globe, title: "Instant Sharing", description: "One-click publish & share" },
  { icon: Blocks, title: "Visual Editor", description: "Build with blocks" },
  { icon: Moon, title: "Dark Mode", description: "Built for night owls" },
  { icon: Zap, title: "Lightning Fast", description: "No installs, start in seconds" },
]

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Particle Network Background */}
      <ParticleNetwork />

      <SeoHead
        title="CodeScapes - Your Code is a Masterpiece"
        description="Create, visualize, and share interactive code directly in your browser. From p5.js sketches to Python turtle graphics—bring your ideas to life."
        url="https://codescapes.io"
        keywords={["creative coding", "p5.js", "Python", "browser IDE", "code playground"]}
      />

      <Header showFullLogo isFixed />

      {/* Centered Grid Layout */}
      <main className="flex-1 px-4 pb-16 pt-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-6 gap-3 lg:gap-4">
          {/* Hero Section */}
          <HeroCard />
          <TaglineCard />

          {/* Features Section */}
          <SectionCard
            title="Everything You Need"
            highlightWord="Need"
            subtitle="A complete creative coding environment in your browser."
            showCTA
            ctaText="Get Started Free"
            className="col-span-6 lg:col-span-2 lg:row-span-2"
          />
          <FeatureCard
            icon={features[0].icon}
            title={features[0].title}
            description={features[0].description}
            delay={0.1}
          />
          <FeatureCard
            icon={features[1].icon}
            title={features[1].title}
            description={features[1].description}
            delay={0.15}
          />
          <FeatureCard
            icon={features[2].icon}
            title={features[2].title}
            description={features[2].description}
            delay={0.2}
          />
          <FeatureCard
            icon={features[3].icon}
            title={features[3].title}
            description={features[3].description}
            delay={0.25}
          />
          <FeatureCard
            icon={features[4].icon}
            title={features[4].title}
            description={features[4].description}
            delay={0.3}
          />
          <FeatureCard
            icon={features[5].icon}
            title={features[5].title}
            description={features[5].description}
            delay={0.35}
          />

          {/* Scapper AI Showcase */}
          <ScapperShowcase />

          {/* Community Section - Big Card + Many Small Scapes */}
          <SectionCard
            title="From the Community"
            highlightWord="Community"
            subtitle="See what creators are building on CodeScapes."
            viewAllLink="/community"
            delay={0.4}
            className="col-span-6 lg:col-span-2 lg:row-span-2"
          />
          {/* Small scapes - 1 col each on lg = 4 per row next to the big card */}
          <ScapeCard scapeIndex={0} delay={0.45} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={1} delay={0.5} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={2} delay={0.55} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={3} delay={0.6} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={4} delay={0.65} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={5} delay={0.7} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={6} delay={0.75} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={7} delay={0.8} className="col-span-2 lg:col-span-1" />

          {/* More small scapes - full row */}
          <ScapeCard scapeIndex={8} delay={0.85} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={9} delay={0.9} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={10} delay={0.95} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={11} delay={1.0} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={12} delay={1.05} className="col-span-2 lg:col-span-1" />
          <ScapeCard scapeIndex={13} delay={1.1} className="col-span-2 lg:col-span-1" />

          {/* CTA - Inside grid, spanning full width */}
          <div className="col-span-6">
            <CTACard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
