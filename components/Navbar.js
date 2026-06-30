"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "./Button";

const links = [
  { label: "Home", href: "/" },
  { label: "Analyze", href: "/analyze" },
  { label: "Sample Report", href: "/report" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0 text-base font-black tracking-tight text-ink sm:text-lg">
          HireReady CV
        </Link>

        <div className="hidden items-center gap-5 md:flex lg:gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Button href="/analyze">Analyze My CV</Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-ink transition hover:bg-slate-50 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded bg-ink" />
            <span className="block h-0.5 w-5 rounded bg-ink" />
            <span className="block h-0.5 w-5 rounded bg-ink" />
          </span>
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2" onClick={() => setOpen(false)}>
              <Button href="/analyze">Analyze My CV</Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
