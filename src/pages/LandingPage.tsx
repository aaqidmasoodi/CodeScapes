import { SeoHead } from "@/components/common/SeoHead"
import { Header } from "@/components/layout/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { CommunityShowcase } from "@/components/landing/CommunityShowcase"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoHead
        title="CodeScapes - Your Code is a Masterpiece"
        description="Create, visualize, and share interactive code directly in your browser. From p5.js sketches to Python turtle graphics—bring your ideas to life."
        url="https://codescapes.io"
        keywords={["creative coding", "p5.js", "Python", "browser IDE", "code playground"]}
      />

      {/* Header */}
      <Header showFullLogo />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <CommunityShowcase />
        <HowItWorks />
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
