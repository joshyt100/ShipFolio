"use client"

import Link from "next/link"
import { Ship, Github } from "lucide-react"
import { Button } from "../ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Ship size={30} className="text-indigo-600" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ShipFolio</span>
        </Link>
        <div className="hidden md:flex md:items-center md:gap-8">
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">How It Works</Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">FAQ</Link>
          </nav>
          <Button asChild variant="default" size="sm" className="gap-2 rounded-md px-5 bg-black text-white shadow-sm">
            <Link href="/signin" className="flex items-center">
              <Github className="h-4 w-4 text-white" /> Sign in
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}

