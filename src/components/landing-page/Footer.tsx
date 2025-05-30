import Link from "next/link"
import { BarChart3, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-16 md:py-20">
      <div className="container mx-auto max-w-screen-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex flex-col items-center gap-6 md:items-start">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">ShipFolio</span>
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} ShipFolio. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-16 sm:grid-cols-3 md:gap-10">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Product</h3>
              <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary">How It Works</Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Company</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#22d3ee]">About</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#22d3ee]">Blog</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#22d3ee]">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Legal</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#f43f5e]">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#f43f5e]">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#f43f5e]">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

