export default function FeatureCard({ title, description, icon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {icon ? (
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-action">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
