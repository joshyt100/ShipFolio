import { Check } from "lucide-react"

const data = [
  {
    title: "Developer Identity",
    iconBg: "bg-gradient-subtle-teal text-[#22d3ee]",
    points: [
      "GitHub avatar, bio, location, and join date",
      "Follower & repository statistics",
      "Unique shareable URL: shipfolio.dev/yourname",
    ],
  },
  {
    title: "Activity Metrics",
    iconBg: "bg-gradient-subtle text-primary",
    points: [
      "Contribution metrics across commits, PRs, issues, and reviews",
      "Interactive contribution calendar heatmap",
      "Monthly commit trends with beautiful visualizations",
    ],
  },
  {
    title: "Developer Highlights",
    iconBg: "bg-gradient-subtle-rose text-[#f43f5e]",
    points: [
      "Programming language breakdown with visual charts",
      "Top repositories by activity, stars, or forks",
      "Longest contribution streaks and milestones",
    ],
  },
  {
    title: "Personalization",
    iconBg: "bg-gradient-subtle-amber text-[#f59e0b]",
    points: [
      "Toggle and reorder sections with simple controls",
      "Choose from multiple themes and layout templates",
      "Download as shareable images for LinkedIn or resumes",
    ],
  },
]

export function Features() {
  return (
    <section id="features" className="container mx-auto relative space-y-16 py-24 md:py-32 max-w-screen-xl">
      <div className="absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-3xl" />
      <div className="absolute bottom-20 left-1/3 h-60 w-60 rounded-full bg-gradient-subtle-rose blur-3xl" />

      <div className="mx-auto max-w-[58rem] text-center space-y-4">
        <div className="rounded-full border border-border/40 bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">
          Features
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Everything you need to <span className="text-gradient-primary">showcase your work</span>
        </h2>
        <p className="max-w-[85%] text-muted-foreground sm:text-lg mx-auto">
          ShipFolio connects to your GitHub profile and automatically builds a stunning portfolio page.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {data.map((f) => (
          <div key={f.title} className="group relative rounded-xl border border-border/40 bg-background p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 duration-300">
            <div className={`h-14 w-14 rounded-full border border-border/40 ${f.iconBg} flex items-center justify-center shadow-md`}>
              {/* icon could go here */}
            </div>
            <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
            <ul className="mt-3 space-y-3">
              {f.points.map(pt => (
                <li key={pt} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 text-current" />
                  <span className="text-sm">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

