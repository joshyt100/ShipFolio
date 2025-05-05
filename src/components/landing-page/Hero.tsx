import Link from "next/link"
import { Star, Github } from "lucide-react"
import { Button } from "../ui/button"

export function Hero() {
  const gridBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none'%3E%3Cpath d='M0 16V0M16 0H0' stroke='black' stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E"

  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-white overflow-hidden">
      {/* bold grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      {/* subtle mask */}
      <div
        className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none z-0"
        style={{ backgroundImage: `url("${gridBackground}")`, backgroundSize: "16px 16px" }}
      />
      {/* blobs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-b from-primary/10 to-accent/10 blur-3xl" />
      <div className="absolute top-20 left-1/4 h-60 w-60 rounded-full bg-gradient-to-b from-[#22d3ee]/10 to-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-t from-accent/10 to-primary/10 blur-3xl" />

      <div className="container mx-auto relative z-10 max-w-screen-xl text-center">
        <div className="mx-auto max-w-[980px] flex flex-col items-center gap-6">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
            Introducing ShipFolio
            <Star className="ml-1 h-3 w-3 fill-primary text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your GitHub,{" "}
            <span className="bg-gradient-to-tr from-purple-400 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Visualized
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Transform your raw GitHub contributions into a beautifully customizable,
            shareable portfolio page that showcases your developer journey.
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button size="lg" className="h-12 gap-2 rounded-md px-8 bg-black text-white shadow-md">
              <Github className="h-4 w-4" />
              <Link href="/signin" className="flex items-center">Sign in with GitHub</Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 rounded-md px-8 border-primary/20 hover:border-primary/40 hover:bg-gradient-subtle">
              <Link href="#demo" className="flex items-center">View Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

