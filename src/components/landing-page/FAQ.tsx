import { ArrowRight } from "lucide-react"

const faqs = [
  {
    q: "Is ShipFolio completely free?",
    a: "ShipFolio offers a generous free tier that includes all core features. We also offer premium features for power users.",
    color: "text-primary",
  },
  {
    q: "What GitHub permissions do you require?",
    a: "We only request read-only access to your public GitHub data. Private-repo stats need read access too.",
    color: "text-[#22d3ee]",
  },
  {
    q: "Can I customize my portfolio URL?",
    a: "Yes! Every user gets shipfolio.dev/username. Premium users can also set up custom domains.",
    color: "text-[#f43f5e]",
  },
  {
    q: "How often is my portfolio updated?",
    a: "Your portfolio updates daily, and you can trigger manual updates anytime from your dashboard.",
    color: "text-[#f59e0b]",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="relative bg-muted/5 py-24 md:py-32">
      <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
      <div className="absolute top-20 left-1/4 h-60 w-60 rounded-full bg-gradient-subtle-rose blur-3xl" />

      <div className="container mx-auto max-w-screen-xl">
        <div className="mx-auto mb-16 max-w-[58rem] text-center space-y-4">
          <div className="rounded-full bg-gradient-subtle px-3 py-1 text-xs font-medium text-primary">FAQ</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently asked <span className="text-gradient-accent">questions</span>
          </h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-6">
          {faqs.map(({ q, a, color }) => (
            <div key={q} className="group relative rounded-xl border bg-background p-6 shadow-md hover:-translate-y-1 hover:shadow-xl duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{q}</h3>
                <ArrowRight className={`${color} h-4 w-4`} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

