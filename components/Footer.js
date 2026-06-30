export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black tracking-tight text-ink">HireReady CV</p>
          <p className="mt-1">MVP preview - analysis is rule-based and for guidance only.</p>
        </div>
        <p>(c) 2026 HireReady CV. All rights reserved.</p>
      </div>
    </footer>
  );
}
