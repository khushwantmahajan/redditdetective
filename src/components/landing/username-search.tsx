"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, isValidRedditUsername, normalizeUsernameInput } from "@/lib/utils";

const EXAMPLE_USERNAMES = ["spez", "kn0thing", "GallowBoob"];

export function UsernameSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submitUsername(raw: string) {
    const username = normalizeUsernameInput(raw);

    if (!username) {
      setError("Enter a Reddit username to get started.");
      return;
    }
    if (!isValidRedditUsername(username)) {
      setError("Usernames are 3–20 characters: letters, numbers, underscores, or hyphens.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    router.push(`/u/${encodeURIComponent(username)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitUsername(value);
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "group flex items-center gap-2 rounded-2xl border bg-surface/80 p-2 pl-4 shadow-2xl shadow-black/40 backdrop-blur-xl transition-colors focus-within:border-accent-violet/50",
            error ? "border-accent-rose/50" : "border-white/10"
          )}
        >
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="hidden shrink-0 font-mono text-sm text-muted-foreground sm:inline">
            u/
          </span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="username, u/username, or profile URL"
            aria-label="Reddit username"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button type="submit" size="md" disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <>
                <span className="hidden sm:inline">Investigate</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-3 flex min-h-[1.5rem] flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs">
        {error ? (
          <span role="alert" className="text-accent-rose">
            {error}
          </span>
        ) : (
          <>
            <span className="text-muted-foreground">Try:</span>
            {EXAMPLE_USERNAMES.map((name, i) => (
              <span key={name} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue(name);
                    submitUsername(name);
                  }}
                  className="text-muted underline decoration-white/20 underline-offset-2 transition-colors hover:text-foreground hover:decoration-white/40 cursor-pointer"
                >
                  u/{name}
                </button>
                {i < EXAMPLE_USERNAMES.length - 1 && (
                  <span className="text-muted-foreground/40">·</span>
                )}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
