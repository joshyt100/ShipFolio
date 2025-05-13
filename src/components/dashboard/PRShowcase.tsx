"use client"
import { GitPullRequest, Eye, Link } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PRShowcase() {
  return (
    <section className="container mb-16 mx-auto py-8 max-w-screen-xl">
      <div className="mx-auto max-w-[48rem] text-center space-y-2 mb-6">
        <div className="rounded-full border border-border/40 bg-background/80 px-3 py-1 text-sm font-medium text-primary mx-auto w-fit">
          Professional Showcase
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Your GitHub portfolio,{" "}
          <span className="bg-gradient-to-tr from-rose-500 via-rose-500/80 to-rose-500/60 bg-clip-text text-transparent dark:from-rose-500 dark:via-rose-500/80 dark:to-rose-500/60">
            anywhere you need it
          </span>
        </h2>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-xl border border-border/40 bg-background p-4 shadow-lg overflow-hidden">

          {/* PR Showcase UI */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 order-2 md:order-1">
              <h3 className="text-base font-semibold mb-2">Stand out to recruiters and hiring managers</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Link className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">
                    <span className="font-medium">Add to LinkedIn</span> profile to showcase your coding skills
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Link className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">
                    <span className="font-medium">Include in resume</span> to give tangible examples of your work
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Link className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">
                    <span className="font-medium">Share on Twitter</span> to build your developer brand
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Link className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">
                    <span className="font-medium">Add to email signature</span> for a professional developer presence
                  </span>
                </li>
              </ul>

              <div className="mt-4">
                <Button variant="outline" size="sm" className="text-xs">
                  shipfolio.dev/yourname
                </Button>
              </div>
            </div>

            <div className="flex-1 order-1 md:order-2">
              <div className="relative">
                {/* PR Card Example */}
                <div className="rounded-lg border border-border/40 bg-background shadow-md p-3 max-w-xs mx-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <GitPullRequest className="h-4 w-4 text-emerald-500" />
                    <div className="text-xs font-medium truncate">Feature: Add dark mode support</div>
                  </div>
                  <div className="rounded bg-muted/30 p-2 mb-2">
                    <pre className="text-[10px] overflow-x-auto">
                      <code>
                        {`const [theme, setTheme] = useState('light');
function toggleTheme() {
  setTheme(theme === 'light' ? 'dark' : 'light');
}`}
                      </code>
                    </pre>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>3 days ago</span>
                    <span>+248 -37</span>
                  </div>
                </div>

                {/* Preview indicator */}
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center shadow-md border border-border/40 text-cyan-500">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

