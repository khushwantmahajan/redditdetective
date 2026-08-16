export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6" role="status" aria-label="Loading profile">
      <div className="h-4 w-28 animate-pulse rounded bg-white/10" />

      <div className="glass-card mt-8 rounded-2xl p-8 text-center">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-2xl bg-white/10" />
        <div className="mx-auto mt-5 h-6 w-40 animate-pulse rounded bg-white/10" />
        <div className="mx-auto mt-3 h-4 w-48 animate-pulse rounded bg-white/10" />

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          <div className="h-[72px] animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
          <div className="h-[72px] animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
        </div>

        <div className="mt-8 h-28 animate-pulse rounded-xl border border-dashed border-white/15 bg-white/[0.015]" />
      </div>
    </div>
  );
}
