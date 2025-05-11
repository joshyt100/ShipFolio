import { Github, LayoutDashboard, Share2 } from "lucide-react"

const steps = [
  {
    num: "1",
    bgNum: "bg-primary",
    iconBg: "bg-primary/10 text-primary",
    icon: <Github className="h-10 w-10" />,
    title: "Sign in with GitHub",
    desc: "Connect your GitHub account securely with OAuth. We only request read access to your public data.",
  },
  {
    num: "2",
    bgNum: "bg-cyan-500",
    iconBg: "bg-cyan-500/10 text-cyan-500",
    icon: <LayoutDashboard className="h-10 w-10" />,
    title: "Customize Your Portfolio",
    desc: "Choose what to highlight, select your theme, and personalize your portfolio to match your style.",
  },
  {
    num: "3",
    bgNum: "bg-rose-500",
    iconBg: "bg-rose-500/10 text-rose-500",
    icon: <Share2 className="h-10 w-10" />,
    title: "Share Your Portfolio",
    desc: "Get a unique URL to share with recruiters, colleagues, or on social media.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-background py-24 md:py-32">

      <div className="container mx-auto max-w-screen-xl text-center space-y-4 mb-16">
        <div className="rounded-full border border-border/40 bg-background px-3 py-1 text-xs font-medium text-primary mx-auto w-fit">
          How It Works
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Three simple steps to your{" "}
          <span className="bg-gradient-to-tr from-cyan-500 via-cyan-500/80 to-cyan-500/60 bg-clip-text text-transparent dark:from-cyan-500 dark:via-cyan-500/80 dark:to-cyan-500/60">
            portfolio
          </span>
        </h2>
        <p className="max-w-[85%] text-muted-foreground mx-auto sm:text-lg">
          Creating your developer portfolio has never been easier.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2"
          >
            <div
              className={`absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full ${s.bgNum} text-sm font-semibold text-white shadow-lg`}
            >
              {s.num}
            </div>
            <div
              className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/40 ${s.iconBg} shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}
            >
              {s.icon}
            </div>
            <h3 className="mb-3 text-xl font-semibold">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

