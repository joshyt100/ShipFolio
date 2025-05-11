import { Check, Eye, Link, GitPullRequest, DropletsIcon } from "lucide-react"

const data = [
  {
    title: "Instant Preview",
    iconBg: "bg-cyan-500/10 text-cyan-500",
    icon: <Eye className="h-4 w-4" />,
    points: [
      "See changes in real-time as you customize",
      "Preview exactly how recruiters will view your profile",
    ],
  },
  {
    title: "Featured PRs",
    iconBg: "bg-primary/10 text-primary",
    icon: <GitPullRequest className="h-4 w-4" />,
    points: [
      "Drag & drop your best pull requests",
      "Highlight code you're most proud of",
    ],
  },
  {
    title: "Professional Link",
    iconBg: "bg-rose-500/10 text-rose-500",
    icon: <Link className="h-4 w-4" />,
    points: [
      "Add to developer profiles and your resume",
      "Shareable URL: shipfolio.dev/yourname",
    ],
  },
  {
    title: "Easy Customization",
    iconBg: "bg-amber-500/10 text-amber-500",
    icon: <DropletsIcon className="h-4 w-4" />,
    points: [
      "Intuitive drag & drop interface",
      "Rearrange sections with simple gestures",
    ],
  },
]

export function Features() {
  return (
    <section id="features" className="container mx-auto relative py-12 max-w-screen-xl">
      {/* Background Blurs (no pointer events, behind everything) */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl z-0" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-60 w-60 rounded-full bg-primary/5 blur-3xl z-0" />

      {/* Heading (above blur) */}
      <div className="mx-auto max-w-3xl text-center space-y-2 mb-8 relative z-10">
        <div className="rounded-full border border-border/40 bg-background/80 px-3 py-1 text-sm font-medium text-primary mx-auto w-fit">
          Features
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Everything you need to{" "}
          <span className="bg-gradient-to-tr from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent dark:from-primary dark:via-primary/80 dark:to-primary/60">
            showcase your GitHub & open source contributions
          </span>
        </h2>
      </div>

      {/* Feature Cards (above blur, animate on hover) */}
      <div className="relative z-10 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8">
        {data.map((f) => (
          <div
            key={f.title}
            className="group flex flex-row items-start text-lg gap-4 rounded-xl border border-border/70 bg-background p-4 pb-6 transition-transform duration-300 hover:shadow-md  "
          >
            <div
              className={`min-h-[2.5rem] min-w-[2.5rem] rounded-md ${f.iconBg} border border-border/40 flex items-center justify-center shadow-sm`}
            >
              {f.icon}
            </div>
            <div className="flex-1">
              <h3 className=" font-semibold text-md">{f.title}</h3>
              <ul className="mt-1 space-y-1 text-sm leading-tight text-muted-foreground">
                {f.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-3 w-3 text-primary" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

