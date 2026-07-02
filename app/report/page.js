"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import ScoreCard from "../../components/ScoreCard";
import { reportData } from "../../lib/reportData";

const legacyStorageKey = "hireready-cv-report";
const generatedStorageKey = "hireready_generated_report";

function getStoredReport() {
  try {
    const stored =
      window.localStorage.getItem(generatedStorageKey) ||
      window.localStorage.getItem(legacyStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getStatusClass(status) {
  if (status === "Good") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Missing") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function ListCard({ title, items = [], ordered = false }) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black tracking-tight text-ink">{title}</h2>
      <ListTag className={`${ordered ? "list-decimal pl-5" : "space-y-3"} mt-4 text-slate-600`}>
        {items.map((item) => (
          <li key={item} className={ordered ? "pl-1 leading-7" : "flex gap-3 leading-7"}>
            {ordered ? null : <span className="mt-2 h-2 w-2 flex-none rounded-full bg-action" />}
            <span>{item}</span>
          </li>
        ))}
      </ListTag>
    </article>
  );
}

function KeywordPills({ keywords = [], tone = "matched" }) {
  const toneClass =
    tone === "missing"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-blue-100 bg-blue-50 text-action";

  if (!keywords.length) {
    return <p className="text-sm leading-6 text-slate-500">No keywords to show.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <span key={keyword} className={`rounded-full border px-3 py-1.5 text-sm font-bold ${toneClass}`}>
          {keyword}
        </span>
      ))}
    </div>
  );
}

function AiFeedbackCard({ feedback }) {
  if (!feedback) return null;

  return (
    <article className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-action">Optional AI Feedback</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">Gemini CV Improvement Notes</h2>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-action">
          Generated on request
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Summary</h3>
          <p className="mt-3 leading-7 text-slate-700">{feedback.aiSummary}</p>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
            Rewritten Summary Suggestion
          </h3>
          <p className="mt-3 leading-7 text-slate-700">{feedback.rewrittenSummarySuggestion}</p>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Top Three Fixes</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-slate-700">
            {feedback.topThreeFixes?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
            Improved Bullet Examples
          </h3>
          <ul className="mt-3 space-y-2 leading-7 text-slate-700">
            {feedback.improvedBulletExamples?.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 h-2 w-2 flex-none rounded-full bg-action" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Recruiter Advice</h3>
        <p className="mt-3 leading-7 text-slate-700">{feedback.recruiterAdvice}</p>
      </section>
    </article>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState(reportData);
  const [isGenerated, setIsGenerated] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState("");

  useEffect(() => {
    const storedReport = getStoredReport();

    if (storedReport?.scores?.length) {
      setReport(storedReport);
      setIsGenerated(true);
    }
  }, []);

  function handlePrint() {
    window.print();
  }

  function handleClearReport() {
    window.localStorage.removeItem(generatedStorageKey);
    setReport(reportData);
    setIsGenerated(false);
    setAiFeedback(null);
    setAiFeedbackError("");
  }

  async function handleGenerateAiFeedback() {
    setIsGeneratingFeedback(true);
    setAiFeedbackError("");

    try {
      const response = await fetch("/api/gemini-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "AI feedback could not be generated right now.");
      }

      setAiFeedback(data);
    } catch (error) {
      setAiFeedbackError(error?.message || "AI feedback could not be generated right now.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-action shadow-sm">
                {isGenerated ? "Generated from your uploaded CV" : "Sample report"}
              </p>
              <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">
                {isGenerated ? "Your CV Report" : "Sample CV Report"}
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {isGenerated
                  ? "This report uses extracted PDF text and transparent rules. No backend processing is used."
                  : "This preview uses illustrative data to show how your CV analysis will appear."}
              </p>
            </div>
            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3 lg:min-w-[430px]">
              <Button href="/analyze">Analyze Another CV</Button>
              <Button onClick={handlePrint} variant="secondary">Print / Save Report</Button>
              <Button onClick={handleClearReport} variant="danger">Clear Report</Button>
            </div>
          </div>

          {isGenerated ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="font-bold text-ink">File</p>
                  <p className="mt-1 break-words">{report.fileName || "Uploaded CV"}</p>
                </div>
                <div>
                  <p className="font-bold text-ink">Target role</p>
                  <p className="mt-1">{report.targetRole || "General role"}</p>
                </div>
                <div>
                  <p className="font-bold text-ink">Country</p>
                  <p className="mt-1">{report.country || "General"}</p>
                </div>
                <div>
                  <p className="font-bold text-ink">Experience level</p>
                  <p className="mt-1">{report.experienceLevel || "Junior"}</p>
                </div>
              </div>
            </article>
          ) : null}

          <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-ink">AI Feedback</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  AI feedback sends your extracted CV/report data to Gemini only when you click this button.
                </p>
              </div>
              <Button onClick={handleGenerateAiFeedback} disabled={isGeneratingFeedback}>
                {isGeneratingFeedback ? "Generating AI feedback..." : "Generate AI Feedback"}
              </Button>
            </div>
            {aiFeedbackError ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                {aiFeedbackError}
              </p>
            ) : null}
          </article>

          <AiFeedbackCard feedback={aiFeedback} />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {report.scores.map((item) => (
              <ScoreCard key={item.label} {...item} />
            ))}
          </div>

          {isGenerated ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Words", report.checks?.wordCount ?? 0],
                [
                  "Contact",
                  report.checks?.hasEmail && report.checks?.hasPhone
                    ? "Email + phone"
                    : "Incomplete",
                ],
                [
                  "Sections",
                  [
                    report.checks?.hasSkills ? "Skills" : null,
                    report.checks?.hasExperience ? "Experience" : null,
                    report.checks?.hasProjects ? "Projects" : null,
                    report.checks?.hasEducation ? "Education" : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Needs structure",
                ],
                [
                  "Impact signals",
                  `${report.checks?.achievementCount ?? 0} numbers / ${report.checks?.actionVerbCount ?? 0} verbs`,
                ],
              ].map(([label, value]) => (
                <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-black text-ink">{value}</p>
                </article>
              ))}
            </div>
          ) : null}

          <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-ink">Job Description Match</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {report.hasJobDescription
                    ? "This score compares your CV against the job description you provided."
                    : "No job description was provided. Keyword matching is based on your selected target role."}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Job Description Match Score
                </p>
                <p className="mt-1 text-3xl font-black text-ink">
                  {report.hasJobDescription ? report.jobDescriptionMatchScore ?? 0 : "-"}
                  {report.hasJobDescription ? <span className="text-base text-slate-500">/100</span> : null}
                </p>
              </div>
            </div>

            {report.hasJobDescription ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                    Matched keywords
                  </h3>
                  <div className="mt-3">
                    <KeywordPills keywords={report.matchedJobKeywords} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                    Missing keywords
                  </h3>
                  <div className="mt-3">
                    <KeywordPills keywords={report.missingJobKeywords} tone="missing" />
                  </div>
                </div>
              </div>
            ) : null}
          </article>

          {isGenerated && report.scoreExplanation?.length ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Score Explanation</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {report.scoreExplanation.map((item) => (
                  <p key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ) : null}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Summary</h2>
              <p className="mt-4 leading-7 text-slate-600">{report.summary}</p>
            </article>

            {isGenerated && report.topStrengths?.length ? (
              <ListCard title="Top Strengths" items={report.topStrengths} />
            ) : null}

            <ListCard title="Top Problems" items={report.topProblems} ordered />

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">
                {isGenerated ? "Missing Role Keywords" : "Missing Keywords"}
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {report.missingKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold text-action"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </article>

            <ListCard title="Suggested Improvements" items={report.suggestedImprovements} />
          </div>

          {isGenerated && report.atsFormattingNotes?.length ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">ATS Formatting Notes</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {report.atsFormattingNotes.map((note) => (
                  <p key={note} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {note}
                  </p>
                ))}
              </div>
            </article>
          ) : null}

          {isGenerated && report.sectionFeedback?.length ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Section-by-Section Feedback</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {report.sectionFeedback.map((item) => (
                  <div key={item.section} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black text-ink">{item.section}</h3>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {isGenerated && report.actionPlan ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Priority Action Plan</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {[
                  ["Fix first", report.actionPlan.fixFirst],
                  ["Improve next", report.actionPlan.improveNext],
                  ["Nice to have", report.actionPlan.niceToHave],
                ].map(([title, items]) => (
                  <div key={title} className="rounded-2xl bg-slate-50 p-4">
                    <h3 className="font-black text-ink">{title}</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {isGenerated ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Extracted Text Preview</h2>
              <p className="mt-4 max-h-40 overflow-hidden rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {report.extractedTextPreview}
              </p>
            </article>
          ) : null}

          <article className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative bg-slate-50 p-6 sm:p-8">
              <div className="absolute inset-x-8 top-6 h-20 rounded-2xl bg-white/60 blur-sm" aria-hidden="true" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-ink">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                    <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 10h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-ink">
                  Full Detailed Report Locked
                </h2>
                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  Coming soon: rewritten bullet points, section-by-section feedback, recruiter-style recommendations, and country-specific advice.
                </p>
                <div className="mt-6">
                  <Button disabled>Unlock Full Report Soon</Button>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
