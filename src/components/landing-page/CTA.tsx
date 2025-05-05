import Link from "next/link"
import { Star, Github } from "lucide-react"
import { Button } from "../ui/button"

export function CTA() {
  return (
    <section id="get-started" className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:16px_16px] dark:bg-grid-small-white/[0.05]" />
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
      <div className="absolute top-20 right-1/4 h-60 w-60 rounded-full bg-gradient-subtle-teal blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-3xl" />

      <div className="container mx-auto max-w-screen-xl text-center">
        <div className="mx-auto max-w-[58rem] space-y-6 rounded-xl border border-border/40 bg-background/80 p-10 shadow-2xl backdrop-blur md:p-14">
          <div className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
            Get Started Today
            <Star className="ml-1 h-3 w-3 fill-primary text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create your <span className="text-gradient-primary">GitHub portfolio</span>
          </h2>
          <p className="text-muted-foreground sm:text-lg">
            Sign in with GitHub to create your personalized developer portfolio in minutes.
          </p>
          <Link href="/signin" className="text-sm font-medium text-primary underline hover:text-primary/80">
            <Button size="lg" className="mt-6 h-14 gap-3 rounded-md px-10 bg-black text-white shadow-lg">
              <Github className="h-5 w-5" /> Sign in with GitHub
            </Button>
          </Link>
          <p className="mt-8 text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-primary underline hover:text-primary/80">Terms of Service</Link>{" "}
            and{" "}
            <Link href="#" className="text-primary underline hover:text-primary/80">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </section>
  )
}

