export default function ScoreCard({ label, score, max = 100, accent = "#2563EB" }) {
  const percentage = Math.min(100, Math.max(0, Math.round((score / max) * 100)));

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {percentage}%
        </span>
      </div>
      <div className="mt-5 flex items-end gap-1">
        <span className="text-4xl font-black tracking-tight text-ink">{score}</span>
        <span className="pb-1.5 text-sm font-semibold text-slate-500">/{max}</span>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: accent }}
        />
      </div>
    </article>
  );
}
