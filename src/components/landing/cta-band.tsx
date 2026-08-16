import { UsernameSearch } from "./username-search";

export function CtaBand() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="glass-card relative overflow-hidden rounded-3xl px-6 py-14 sm:px-14">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent-cyan/10"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Start investigating in seconds
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
              No account, no API key, no waiting. Just enter a username.
            </p>
            <div className="mt-8 flex justify-center">
              <UsernameSearch />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
