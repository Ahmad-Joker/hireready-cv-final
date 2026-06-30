import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ScoreCard from "../components/ScoreCard";
import FeatureCard from "../components/FeatureCard";
import StepCard from "../components/StepCard";
import { reportData } from "../lib/reportData";

const features = [
  {
    title: "ATS compatibility score",
    description: "Understand how readable your CV is for applicant tracking systems.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M5 12.5l4 4L19 6.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Keyword gap analysis",
    description: "Find missing role-specific keywords that recruiters and ATS tools may look for.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "CV structure feedback",
    description: "Review your sections, layout, clarity, and overall organization.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M6 5h12M6 12h12M6 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Egypt / UK job market targeting",
    description: "Adjust your CV direction depending on where you are applying.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 21s7-4.6 7-11A7 7 0 0 0 5 10c0 6.4 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Student and junior-friendly advice",
    description: "Get practical tips even if you have limited work experience.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M4 7l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 10v5c0 1.2 2.2 3 5 3s5-1.8 5-3v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-action shadow-sm">
              Built for Egypt, UK, and international applications
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Free AI CV Checker for Egypt & UK Job Applications
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Upload your CV, get an ATS score, find missing keywords, and improve your chances before applying.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/analyze">Analyze My CV Free</Button>
              <Button href="/report" variant="secondary">View Sample Report</Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="rounded-3xl bg-ink p-6 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-300">CV Score</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Sample</span>
              </div>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-6xl font-black tracking-tight">76</span>
                <span className="pb-2 text-lg font-bold text-slate-300">/100</span>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[76%] rounded-full bg-success" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["ATS Score", "82"],
                ["Keyword Match", "64"],
                ["Structure", "79"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">How it works</h2>
            <p className="mt-3 text-slate-600">Get useful CV feedback in three simple steps.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StepCard number="1" title="Upload your CV" description="Start with your current CV in PDF format." />
            <StepCard number="2" title="Choose target role and country" description="Tell us what role you are applying for and whether you are targeting Egypt, the UK, or international roles." />
            <StepCard number="3" title="Get your CV score and improvement tips" description="See your ATS score, keyword gaps, structure feedback, and practical next steps." />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-ink">What the checker reviews</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-black tracking-tight text-ink">Sample report preview</h2>
            <Link href="/report" className="text-sm font-bold text-action hover:text-blue-700">
              See full sample report →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reportData.scores.map((item) => (
              <ScoreCard key={item.label} {...item} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-ink">Start free, upgrade later</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <p className="text-sm font-bold text-success">Available now</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-ink">Free Basic Report</h3>
              <ul className="mt-6 space-y-3 text-sm font-medium text-slate-600">
                {["CV score", "ATS score", "Keyword gaps", "Basic improvement tips"].map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/analyze">Analyze My CV Free</Button>
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                Coming Soon
              </span>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-ink">Full Detailed Report</h3>
              <ul className="mt-6 space-y-3 text-sm font-medium text-slate-600">
                {[
                  "Rewritten bullet points",
                  "Section-by-section feedback",
                  "Recruiter-style recommendations",
                  "Country-specific advice",
                ].map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button disabled>Coming Soon</Button>
              </div>
            </article>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#0F172A] px-6 py-12 text-white shadow-soft sm:px-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Ready to improve your CV before applying?
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-200">
                Start with a free sample analysis and see what your CV could improve.
              </p>
              <div className="mt-8">
                <Button href="/analyze" variant="secondary">Analyze My CV Free</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
