import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan">
                <SearchIcon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                RedditDetective
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              An independent tool for exploring public Reddit activity. Not affiliated with,
              endorsed by, or sponsored by Reddit, Inc.
            </p>
          </div>

          <a
            href="https://github.com/khushwantmahajan/redditdetective"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/20 hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RedditDetective. All data shown is publicly available on Reddit.</p>
          <p>Built with Next.js · Currently running on mock data</p>
        </div>
      </div>
    </footer>
  );
}
