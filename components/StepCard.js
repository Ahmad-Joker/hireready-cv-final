export default function StepCard({ number, title, description }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lg font-black text-white">
        {number}
      </div>
      <h3 className="mt-6 text-lg font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
