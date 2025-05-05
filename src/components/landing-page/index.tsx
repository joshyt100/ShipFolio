import { Header } from "./Header"
import { Hero } from "./Hero"
import { DashboardPreview } from "./DashboardPreview"
import { Features } from "./Features"
import { HowItWorks } from "./HowItWorks"
import { FAQ } from "./FAQ"
import { CTA } from "./CTA"
import { Footer } from "./Footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 px-4">
      <Header />
      <main className="flex-1">
        <Hero />
        <DashboardPreview />
        <Features />
        <HowItWorks />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

