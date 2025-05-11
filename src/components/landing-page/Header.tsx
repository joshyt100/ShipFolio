"use client"

import Link from "next/link"
import { BarChart3, Github, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "../mode-toggle/ModeToggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Ship } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between">

        <Link href="/" className="flex items-center space-x-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Ship size={24} className="text-indigo-600" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ShipFolio</span>
        </Link>
        <div className="hidden md:flex md:items-center md:gap-6">
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button asChild variant="default" size="sm" className="gap-2 rounded-md px-5 shadow-sm">
              <Link href="/signin" className="flex items-center">
                <Github className="h-4 w-4 mr-1" /> Sign in
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
                <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
                <Button asChild variant="default" size="sm" className="gap-2 rounded-md px-5 shadow-sm w-full">
                  <Link href="/signin" className="flex items-center justify-center">
                    <Github className="h-4 w-4 mr-1" /> Sign in with GitHub
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

