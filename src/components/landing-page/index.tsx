import { Header } from "./Header"
import { Hero } from "./Hero"
import { DashboardPreview } from "./DashboardPreview"
import { Features } from "./Features"
import { HowItWorks } from "./HowItWorks"
import { FAQ } from "./FAQ"
import { CTA } from "./CTA"
import { Footer } from "./Footer"
import { PRShowcase } from "../dashboard/PRShowcase"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <PRShowcase />
        {/* <FAQ /> */}
        {/* <CTA /> */}
      </main>
      {/* <Footer /> */}
    </div>
  )
}

