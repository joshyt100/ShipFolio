import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BarChart3,
  Check,
  Github,
  ChevronRight,
  Star,
  Ship,
} from "lucide-react"

import { Button } from "./ui/button"

export default function LandingPage() {
  const gridBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none'%3E%3Cpath d='M0 16V0M16 0H0' stroke='black' stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E";
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 px-4">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
              <Ship size={30} className="text-indigo-600" />
            </div>
            <span className="inline-block text-lg font-semibold tracking-tight">
              ShipFolio
            </span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            <nav className="flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
              </Link>
            </nav>
            <Button
              asChild
              variant="default"
              size="sm"
              className="gap-2 rounded-md px-5 bg-black text-white shadow-sm"
            >
              <Link href="#get-started" className="flex items-center">
                <Github className="h-4 w-4 text-white" />
                Sign in
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 lg:py-32 bg-white overflow-hidden">
          {/* Grid Background */}

          <div
            className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"
          ></div>
          <div
            className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none z-0"
            style={{
              backgroundImage: `url("${gridBackground}")`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Gradient Blurs */}

          {/* Main Content */}
          <div className="container mx-auto relative z-10 max-w-screen-xl">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
                <Star className="mr-1 h-3 w-3 fill-primary  text-primary" />
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
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-md px-8 bg-black text-white shadow-md"
                >
                  <Github className="h-4 w-4" />
                  <Link href="#get-started" className="flex items-center">
                    Sign in with GitHub
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-md px-8 border-primary/20 hover:border-primary/40 hover:bg-gradient-subtle transition-all"
                >
                  <Link href="#demo" className="flex items-center">
                    View Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section
          id="demo"
          className="relative overflow-hidden  bg-muted/5 py-16 md:py-24"
        >
          <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full " />
          <div className="absolute bottom-0 right-1/3 h-60 w-60 rounded-full bg-white" />

          <div className="container mx-auto max-w-screen-xl">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
              <div className="rounded-full border border-border/40 bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
                Dashboard Preview
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Beautiful{" "}
                <span className="text-gradient-primary">visualizations</span> of
                your work
              </h2>
              <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                See how ShipFolio transforms your GitHub data into an impressive
                portfolio
              </p>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -top-6 -left-6 h-12 w-12 rounded-full bg-gradient-primary opacity-20 blur-lg" />
              <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-white opacity-20 blur-lg" />

              <div className="relative rounded-xl border border-border/40 bg- shadow-2xl backdrop-blur overflow-hidden">
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

                <div className="relative">
                  <div className="absolute top-4 left-4 h-24 w-24 rounded-full bg-gradient-primary opacity-10 blur-xl" />
                  <div className="absolute bottom-4 right-4 h-24 w-24 rounded-full bg-gradient-accent opacity-10 blur-xl" />

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
                ShipFolio automatically transforms your GitHub data into
                beautiful, interactive visualizations that showcase your skills
                and contributions.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href="#features"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Explore features <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container mx-auto relative space-y-16 py-24 md:py-32 max-w-screen-xl"
        >
          <div className="absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-60 w-60 rounded-full bg-gradient-subtle-rose blur-3xl" />

          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <div className="rounded-full border border-border/40 bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to{" "}
              <span className="text-gradient-primary">showcase your work</span>
            </h2>
            <p className="max-w-[85%] text-muted-foreground sm:text-lg">
              ShipFolio connects to your GitHub profile and automatically
              builds a stunning portfolio page.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 duration-300">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle-teal opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex flex-col space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle-teal text-[#22d3ee] shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                    <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
                    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Developer Identity</h3>
                  <p className="mt-2 text-muted-foreground">
                    Create a comprehensive profile that showcases your GitHub
                    identity in a professional, visually appealing format.
                  </p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#22d3ee]" />
                    <span className="text-sm">
                      GitHub avatar, bio, location, and join date
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#22d3ee]" />
                    <span className="text-sm">
                      Follower & repository statistics
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#22d3ee]" />
                    <span className="text-sm">
                      Unique shareable URL: shipfolio.dev/yourname
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 duration-300">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex flex-col space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle text-primary shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Activity Metrics</h3>
                  <p className="mt-2 text-muted-foreground">
                    Transform your GitHub activity into beautiful, insightful
                    visualizations that tell the story of your development
                    journey.
                  </p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Contribution metrics across commits, PRs, issues, and
                      reviews
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Interactive contribution calendar heatmap
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Monthly commit trends with beautiful visualizations
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 duration-300">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle-rose opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex flex-col space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle-rose text-[#f43f5e] shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Developer Highlights</h3>
                  <p className="mt-2 text-muted-foreground">
                    Highlight your most impressive achievements and contributions
                    to make them stand out.
                  </p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#f43f5e]" />
                    <span className="text-sm">
                      Programming language breakdown with visual charts
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#f43f5e]" />
                    <span className="text-sm">
                      Top repositories by activity, stars, or forks
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#f43f5e]" />
                    <span className="text-sm">
                      Longest contribution streaks and milestones
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 duration-300">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle-amber opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex flex-col space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle-amber text-[#f59e0b] shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 3v3" />
                    <path d="M18.5 8.5 16 11" />
                    <path d="M8 16H3" />
                    <path d="M3 8h5" />
                    <path d="m16 16 2.5 2.5" />
                    <path d="M21 12h-3" />
                    <path d="M12 21v-3" />
                    <path d="M8.5 8.5 6 6" />
                    <path d="m6 18 2.5-2.5" />
                    <path d="M14.5 9.5 17 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Personalization</h3>
                  <p className="mt-2 text-muted-foreground">
                    Customize your portfolio to match your personal brand and
                    highlight what matters most to you.
                  </p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#f59e0b]" />
                    <span className="text-sm">
                      Toggle and reorder sections with simple controls
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#f59e0b]" />
                    <span className="text-sm">
                      Choose from multiple themes and layout templates
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-[#f59e0b]" />
                    <span className="text-sm">
                      Download as shareable images for LinkedIn or resumes
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="relative  bg-muted/5 py-24 md:py-32"
        >
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-60 w-60 rounded-full bg-gradient-subtle-amber blur-3xl" />

          <div className="container mx-auto max-w-screen-xl">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <div className="rounded-full border border-border/40 bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Three simple steps to your{" "}
                <span className="text-gradient-secondary">portfolio</span>
              </h2>
              <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                Creating your developer portfolio has never been easier.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white shadow-lg">
                  1
                </div>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle text-primary shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary/20">
                  <Github className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  Sign in with GitHub
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account securely with OAuth. We only request
                  read access to your public data.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-secondary text-sm font-semibold text-white shadow-lg">
                  2
                </div>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle-teal text-[#22d3ee] shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-[#22d3ee]/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10"
                  >
                    <path d="M12 3v3" />
                    <path d="M18.5 8.5 16 11" />
                    <path d="M8 16H3" />
                    <path d="M3 8h5" />
                    <path d="m16 16 2.5 2.5" />
                    <path d="M21 12h-3" />
                    <path d="M12 21v-3" />
                    <path d="M8.5 8.5 6 6" />
                    <path d="m6 18 2.5-2.5" />
                    <path d="M14.5 9.5 17 7" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  Customize Your Portfolio
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose what to highlight, select your theme, and personalize
                  your portfolio to match your style.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-sm font-semibold text-white shadow-lg">
                  3
                </div>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/40 bg-gradient-subtle-rose text-[#f43f5e] shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-[#f43f5e]/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  Share Your Portfolio
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get a unique URL to share with recruiters, colleagues, or on
                  social media. Download as images for your resume.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          className="relative  bg-muted/5 py-24 md:py-32"
        >
          <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
          <div className="absolute top-20 left-1/4 h-60 w-60 rounded-full bg-gradient-subtle-rose blur-3xl" />

          <div className="container mx-auto max-w-screen-xl">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <div className="rounded-full border  bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
                FAQ
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Frequently asked{" "}
                <span className="text-gradient-accent">questions</span>
              </h2>
              <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                Everything you need to know about ShipFolio.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-3xl space-y-6">
              {/* FAQ Item 1 */}
              <div className="group relative overflow-hidden rounded-xl border  bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 duration-300">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Is ShipFolio completely free?
                  </h3>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <div className="relative mt-3 text-sm text-muted-foreground">
                  ShipFolio offers a generous free tier that includes all core
                  features. We also offer premium features for power users who
                  need advanced customization and analytics.
                </div>
              </div>

              {/* FAQ Item 2 */}
              <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#22d3ee]/30 duration-300">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle-teal opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    What GitHub permissions do you require?
                  </h3>
                  <ArrowRight className="h-4 w-4 text-[#22d3ee]" />
                </div>
                <div className="relative mt-3 text-sm text-muted-foreground">
                  We only request read-only access to your public GitHub data.
                  For users who want to include private repository statistics, we
                  request read-only access to those repositories as well.
                </div>
              </div>

              {/* FAQ Item 3 */}
              <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#f43f5e]/30 duration-300">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle-rose opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Can I customize my portfolio URL?
                  </h3>
                  <ArrowRight className="h-4 w-4 text-[#f43f5e]" />
                </div>
                <div className="relative mt-3 text-sm text-muted-foreground">
                  Yes! Every user gets a personalized URL
                  (shipfolio.dev/username). Premium users can also set up custom
                  domains for a more professional presentation.
                </div>
              </div>

              {/* FAQ Item 4 */}
              <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#f59e0b]/30 duration-300">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-subtle-amber opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    How often is my portfolio updated?
                  </h3>
                  <ArrowRight className="h-4 w-4 text-[#f59e0b]" />
                </div>
                <div className="relative mt-3 text-sm text-muted-foreground">
                  Your portfolio automatically updates daily to reflect your
                  latest GitHub activity. You can also trigger manual updates
                  anytime from your dashboard.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="get-started"
          className="relative overflow-hidden bg-background py-24 md:py-32"
        >
          <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:16px_16px] dark:bg-grid-small-white/[0.05]" />
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-60 w-60 rounded-full bg-gradient-subtle-teal blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-3xl" />

          <div className="container mx-auto max-w-screen-xl">
            <div className="mx-auto max-w-[58rem] rounded-xl border border-border/40 bg-background/80 p-10 shadow-2xl backdrop-blur md:p-14">
              <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center">
                <div className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
                  <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
                  Get Started Today
                  <Star className="ml-1 h-3 w-3 fill-primary text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Create your{" "}
                  <span className="text-gradient-primary">
                    GitHub portfolio
                  </span>
                </h2>
                <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                  Sign in with GitHub to create your personalized developer
                  portfolio in minutes.
                </p>
              </div>

              <div className="mx-auto mt-10 flex justify-center">
                <Button
                  size="lg"
                  className="h-14 gap-3 rounded-md px-10 bg-black  hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl hover:shadow-primary/20 text-sm"
                >
                  <Github className="h-5 w-5 text-white" />
                  Sign in with GitHub
                </Button>
              </div>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link
                  href="#"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-16 md:py-20">
        <div className="container mx-auto max-w-screen-xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 md:flex-row">
            <div className="flex flex-col items-center gap-6 md:items-start">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="inline-block text-lg font-semibold tracking-tight">
                  ShipFolio
                </span>
              </Link>
              <p className="text-center text-sm text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} ShipFolio. All rights
                reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-16 sm:grid-cols-3 md:gap-10">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Product</h3>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  How It Works
                </Link>
                <Link
                  href="#faq"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Company</h3>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#22d3ee]"
                >
                  About
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#22d3ee]"
                >
                  Blog
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#22d3ee]"
                >
                  Contact
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Legal</h3>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#f43f5e]"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#f43f5e]"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#f43f5e]"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

