"use client";

/** Minimal, dependency-free bar chart. Renders a row of CSS bars scaled to the max value. */
export function BarChart({
  data,
  className,
}: {
  data: { label: string; value: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={className}>
      <div className="flex h-32 gap-1">
        {data.map((d, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
            <div className="pointer-events-none absolute -top-7 z-10 rounded-md border border-white/10 bg-background-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {d.value}
            </div>
            <div
              className="w-full rounded-t-[3px] bg-gradient-to-t from-accent-violet/70 to-accent-cyan/70 transition-all group-hover:from-accent-violet group-hover:to-accent-cyan"
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
