import { Github } from "lucide-react"

const steps = [
  {
    num: "1",
    bgNum: "bg-gradient-primary",
    iconBg: "bg-gradient-subtle text-primary",
    icon: <Github className="h-10 w-10 text-white" />,
    title: "Sign in with GitHub",
    desc: "Connect your GitHub account securely with OAuth. We only request read access to your public data.",
  },
  {
    num: "2",
    bgNum: "bg-gradient-secondary",
    iconBg: "bg-gradient-subtle-teal text-[#22d3ee]",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {/* ... */}
      </svg>
    ),
    title: "Customize Your Portfolio",
    desc: "Choose what to highlight, select your theme, and personalize your portfolio to match your style.",
  },
  {
    num: "3",
    bgNum: "bg-gradient-accent",
    iconBg: "bg-gradient-subtle-rose text-[#f43f5e]",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {/* ... */}
      </svg>
    ),
    title: "Share Your Portfolio",
    desc: "Get a unique URL to share with recruiters, colleagues, or on social media.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-muted/5 py-24 md:py-32">
      <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
      <div className="absolute top-20 right-1/4 h-60 w-60 rounded-full bg-gradient-subtle-amber blur-3xl" />

      <div className="container mx-auto max-w-screen-xl text-center space-y-4 mb-16">
        <div className="rounded-full border border-border/40 bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
          How It Works
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Three simple steps to your <span className="text-gradient-secondary">portfolio</span>
        </h2>
        <p className="max-w-[85%] text-muted-foreground mx-auto sm:text-lg">
          Creating your developer portfolio has never been easier.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map(s => (
          <div key={s.num} className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
            <div className={`absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full ${s.bgNum} text-sm font-semibold text-white shadow-lg`}>
              {s.num}
            </div>
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/40 ${s.iconBg} shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}>
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

