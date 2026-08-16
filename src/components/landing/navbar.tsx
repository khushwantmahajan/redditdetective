import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "AI insights", href: "#ai-insights" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan">
            <SearchIcon className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            RedditDetective
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/khushwantmahajan/redditdetective"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/20 hover:text-foreground sm:flex"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
