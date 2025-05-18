import Link from "next/link"
import Image from "next/image"
import { Star, Github, GitPullRequest, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative py-10 overflow-hidden">
      {/* Grid background */}
      <div
        className="
    absolute inset-0
    bg-[linear-gradient(to_right,#80808022_1px,transparent_1px),linear-gradient(to_bottom,#80808022_1px,transparent_1px)]
    bg-[size:24px_24px]
    dark:bg-[linear-gradient(to_right,#ffffff11_1px,transparent_1px),linear-gradient(to_bottom,#ffffff11_1px,transparent_1px)]
    pointer-events-none
    z-0
  "
      />


      {/* Subtle mask */}
      <div className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none z-0" />

      {/* Blobs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-20 left-1/4 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto relative z-10 max-w-screen-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left side - Text content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
              <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
              Meet ShipFolio
              <Star className="ml-1 h-3 w-3 fill-primary text-primary" />
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <div className="mb-1">
                Showcase Your GitHub in a
              </div>
              <span className="bg-gradient-to-tr from-purple-400 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Stunning Portfolio
              </span>
            </h1>

            <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-md">
              Easily showcase your open source and Github work with a polished, interactive portfolio. Perfect for resumes, LinkedIn, or your personal site.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
              <Link href="/signin" className="flex">
                <Button size="lg" className="h-10 gap-2 cursor-pointer  rounded-md px-24 shadow-md">
                  <Github className="h-4 w-4" />
                  Get Started with GitHub
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Dashboard Preview */}
          <div className="flex-1 md:max-w-md">
            <div className="relative">
              <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-primary/20 blur-lg" />
              <div className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-primary/20 blur-lg" />

              <div className="rounded-xl border border-border/40 bg-background/80 shadow-xl backdrop-blur overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/30 px-3 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="mx-auto w-full max-w-[180px] rounded-full border border-border/40 bg-background/50 px-2 py-0.5 text-xs text-center text-muted-foreground">
                      shipfolio.dev/yourname
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <Image
                    src="/placeholder.svg?height=800&width=2000"
                    width={1000}
                    height={1000}
                    alt="ShipFolio Dashboard"
                    className="w-full rounded-lg object-cover shadow-lg"
                    priority
                  />
                </div>
              </div>

              <div className="absolute -top-2 right-[20%] transform rotate-3 bg-background rounded-lg border border-border/40 px-2 py-1 shadow-lg text-xs">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-cyan-500" />
                  <span className="text-xs font-medium">Live preview</span>
                </div>
              </div>

              <div className="absolute -bottom-2 left-[20%] transform -rotate-3 bg-background rounded-lg border border-border/40 px-2 py-1 shadow-lg text-xs">
                <div className="flex items-center gap-1">
                  <GitPullRequest className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-medium">Top pull requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

