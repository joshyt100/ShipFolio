import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

export function DashboardPreview() {
  return (
    <section id="demo" className="relative overflow-hidden bg-muted/5 py-16 md:py-24">
      <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
      <div className="container mx-auto max-w-screen-xl">
        <div className="mx-auto mb-12 flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <div className="rounded-full border border-border/40 bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
            Dashboard Preview
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Beautiful <span className="text-gradient-primary">visualizations</span> of your work
          </h2>
          <p className="max-w-[85%] text-muted-foreground sm:text-lg">
            See how ShipFolio transforms your GitHub data into an impressive portfolio
          </p>
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -top-6 -left-6 h-12 w-12 rounded-full bg-gradient-primary opacity-20 blur-lg" />
          <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-gradient-accent opacity-20 blur-lg" />

          <div className="rounded-xl border border-border/40 bg-background/80 shadow-2xl backdrop-blur overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#f43f5e]" />
                <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                <div className="h-3 w-3 rounded-full bg-[#10b981]" />
              </div>
              <div className="ml-4 flex-1">
                <div className="mx-auto w-full max-w-sm rounded-full border border-border/40 bg-background/50 px-3 py-1 text-xs text-center text-muted-foreground">
                  shipfolio.dev/yourname
                </div>
              </div>
            </div>
            <div className="p-4">
              <Image
                src="/placeholder.svg?height=800&width=1400"
                width={1400}
                height={800}
                alt="ShipFolio Dashboard"
                className="w-full rounded-lg object-cover shadow-lg"
                priority
              />
            </div>
          </div>

          <div className="absolute -top-4 right-[20%] transform rotate-3 bg-white dark:bg-black rounded-lg border border-border/40 px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#10b981]" />
              <span className="text-xs font-medium">Live updates</span>
            </div>
          </div>
          <div className="absolute -bottom-4 left-[20%] transform -rotate-3 bg-white dark:bg-black rounded-lg border border-border/40 px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              <span className="text-xs font-medium">Customizable</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-xl flex-col items-center text-center">
          <p className="text-sm text-muted-foreground">
            ShipFolio automatically transforms your GitHub data into beautiful, interactive visualizations.
          </p>
          <Link href="#features" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Explore features <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}

