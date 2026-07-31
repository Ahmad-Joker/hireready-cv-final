"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import ScoreCard from "../../components/ScoreCard";
import WaitlistForm from "../../components/WaitlistForm";
import { reportData } from "../../lib/reportData";

const legacyStorageKey = "hireready-cv-report";
const generatedStorageKey = "hireready_generated_report";
const proDemoStorageKey = "hireready_pro_demo_unlocked";

const scoreMeanings = [
  ["ATS Score", "Formatting and machine-readability."],
  ["Keyword Match", "Alignment with the role or job description."],
  ["Structure Score", "CV organization and section quality."],
  ["Impact Score", "Measurable achievements and action verbs."],
  ["Readability Score", "Clarity, length, and wording quality."],
];

const sampleSectionFeedback = [
  {
    section: "Contact",
    status: "Good",
    feedback: "Email, phone, and professional links should appear as plain text near the top.",
  },
  {
    section: "Summary/Profile",
    status: "Needs work",
    feedback: "The summary should name the target role and show the strongest proof in two or three lines.",
  },
  {
    section: "Experience",
    status: "Needs work",
    feedback: "Experience bullets should lead with action verbs and include measurable outcomes where possible.",
  },
  {
    section: "Skills",
    status: "Needs work",
    feedback: "Group skills by theme and include role-specific keywords that match real experience.",
  },
];

const sampleActionPlan = {
  fixFirst: ["Add measurable outcomes to the most relevant experience bullets.", "Make the summary specific to the target role."],
  improveNext: ["Move important keywords into skills and experience sections.", "Use standard section headings for ATS readability."],
  niceToHave: ["Add a portfolio, LinkedIn, or project link if relevant.", "Trim repeated wording before applying."],
};

const proFeatures = [
  {
    title: "CV Summary Rewrite",
    description: "Get a stronger professional summary tailored to your target role.",
  },
  {
    title: "Weak Bullet Point Rewrite",
    description: "Turn vague experience bullets into achievement-focused statements.",
  },
  {
    title: "Job-Tailored Keyword Placement",
    description: "See exactly where to add missing keywords naturally.",
  },
  {
    title: "Recruiter-Style Checklist",
    description: "Review your CV using a practical hiring checklist.",
  },
  {
    title: "Export Pro PDF Report",
    description: "Download a polished report with all premium recommendations.",
  },
];

const freeReportItems = [
  "CV scores",
  "Keyword gaps",
  "Basic suggestions",
  "Optional AI feedback",
];

const proReportItems = [
  "Rewritten summary",
  "Rewritten bullet points",
  "Job-specific tailoring",
  "Recruiter checklist",
  "Exportable PDF report",
];

const bulletExamplesByRole = {
  developer: [
    "Built and refined web features using JavaScript, React, and clear component structure to improve user workflows.",
    "Debugged interface and data issues by testing user flows, reviewing errors, and documenting fixes for future releases.",
    "Collaborated with teammates to deliver project milestones with clearer requirements, cleaner code, and measurable outcomes.",
  ],
  marketing: [
    "Improved content performance by tracking engagement metrics and optimizing posting strategy.",
    "Supported campaign planning by organizing content calendars and analyzing audience response.",
    "Collaborated with team members to deliver marketing projects with clearer timelines and measurable outcomes.",
  ],
  data: [
    "Analyzed datasets to identify patterns, summarize insights, and support clearer decision-making.",
    "Built reports and visualizations that translated raw data into practical recommendations for stakeholders.",
    "Improved analysis workflows by cleaning data, validating outputs, and documenting repeatable steps.",
  ],
  general: [
    "Improved team outcomes by organizing tasks, tracking progress, and communicating updates clearly.",
    "Supported project delivery by coordinating timelines, documenting requirements, and resolving blockers early.",
    "Strengthened work quality by using feedback, measuring results, and refining processes over time.",
  ],
};

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

function getScore(report, label) {
  return report.scores?.find((item) => item.label === label)?.score ?? 0;
}

function getRoleType(targetRole = "") {
  const role = targetRole.toLowerCase();
  if (/(software|developer|frontend|backend|engineer|react|javascript)/.test(role)) return "developer";
  if (/(marketing|social media|content|seo|campaign)/.test(role)) return "marketing";
  if (/(data|ai|machine learning|analyst|analytics|python)/.test(role)) return "data";
  return "general";
}

function formatKeywordList(keywords = []) {
  const visibleKeywords = keywords.filter(Boolean).slice(0, 3);
  return visibleKeywords.length ? visibleKeywords.join(", ") : "relevant skills";
}

function getSummaryRewrite(report, aiFeedback) {
  if (aiFeedback?.rewrittenSummarySuggestion) {
    return {
      text: aiFeedback.rewrittenSummarySuggestion,
      source: "Powered by your Gemini feedback.",
    };
  }

  const role = report.targetRole || "target role";
  const keywords = report.checks?.matchedKeywords?.length
    ? report.checks.matchedKeywords
    : report.matchedJobKeywords?.length
      ? report.matchedJobKeywords
      : report.missingKeywords;

  return {
    text: `Results-driven ${role} candidate with experience in ${formatKeywordList(keywords)} and a focus on measurable impact, communication, and continuous improvement.`,
    source: "Generate AI Feedback for a stronger rewrite.",
  };
}

function getKeywordPlacement(keyword, index) {
  const normalizedKeyword = keyword.toLowerCase();
  let section = ["Skills", "Experience", "Projects", "Summary"][index % 4];
  let advice = "Add this keyword only where it honestly matches your work, tools, or coursework.";

  if (/(analytics|google|meta|seo|campaign|content|copywriting)/.test(normalizedKeyword)) {
    section = "Skills or Experience";
    advice = "Add it only if you have used it in campaigns, reporting, content planning, or performance review.";
  } else if (/(react|javascript|css|html|node|api|git|sql|python)/.test(normalizedKeyword)) {
    section = "Skills or Projects";
    advice = "Place it beside a real project, technical task, or tool stack you can discuss in an interview.";
  } else if (/(leadership|communication|teamwork|planning|strategy)/.test(normalizedKeyword)) {
    section = "Experience or Summary";
    advice = "Use it inside a result-focused bullet instead of listing it as a loose soft skill.";
  }

  return { keyword, section, advice };
}

function getChecklist(report) {
  const checks = report.checks || {};
  const wordCount = checks.wordCount ?? 0;
  const keywordScore = getScore(report, "Keyword Match");
  const structureScore = getScore(report, "Structure Score");
  const impactScore = getScore(report, "Impact Score");

  return [
    {
      label: "Contact info clear",
      status: checks.hasEmail && checks.hasPhone ? "Passed" : "Missing",
      explanation: checks.hasEmail && checks.hasPhone ? "Email and phone are detectable." : "Add a plain-text email and phone number near the top.",
    },
    {
      label: "Role-specific summary",
      status: checks.hasSummary ? "Passed" : "Needs work",
      explanation: checks.hasSummary ? "A summary/profile section appears to be present." : "Add a short summary tailored to the target role.",
    },
    {
      label: "Relevant skills visible",
      status: checks.hasSkills || structureScore >= 70 ? "Passed" : "Missing",
      explanation: checks.hasSkills ? "A skills section is detectable." : "Add a dedicated skills section with role keywords.",
    },
    {
      label: "Experience has measurable results",
      status: (checks.achievementCount ?? 0) >= 3 || impactScore >= 75 ? "Passed" : "Needs work",
      explanation: "Use numbers, volume, percentages, reach, time saved, or other measurable outcomes.",
    },
    {
      label: "Education is clear",
      status: checks.hasEducation || !report.generated ? "Passed" : "Missing",
      explanation: checks.hasEducation || !report.generated ? "Education is present or represented in the sample report." : "Add degree, institution, dates, and relevant coursework if useful.",
    },
    {
      label: "Job description keywords included",
      status: keywordScore >= 70 ? "Passed" : keywordScore > 0 ? "Needs work" : "Missing",
      explanation: report.hasJobDescription ? "Add the strongest missing job terms where they match your real experience." : "Paste a job description during analysis for a sharper keyword check.",
    },
    {
      label: "CV length is reasonable",
      status: !report.generated || (wordCount >= 250 && wordCount <= 900) ? "Passed" : "Needs work",
      explanation: report.generated ? `${wordCount} words detected. Aim for enough evidence without making the CV hard to scan.` : "The sample report assumes a reasonable one-page early-career CV.",
    },
    {
      label: "Formatting is ATS-friendly",
      status: getScore(report, "ATS Score") >= 75 ? "Passed" : "Needs work",
      explanation: "Keep headings standard, bullets simple, and important text selectable.",
    },
  ];
}

function ProBadge({ children = "Pro" }) {
  return (
    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-action">
      {children}
    </span>
  );
}

function ProContentCard({ title, children, className = "" }) {
  return (
    <article className={`rounded-2xl border border-blue-100 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-black tracking-tight text-ink">{title}</h3>
        <ProBadge />
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function SectionCard({ title, eyebrow, children, className = "" }) {
  return (
    <article className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {eyebrow ? (
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">{eyebrow}</p>
      ) : null}
      <h2 className={eyebrow ? "mt-2 text-xl font-black tracking-tight text-ink" : "text-xl font-black tracking-tight text-ink"}>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function ListBlock({ items = [], ordered = false }) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag className={`${ordered ? "list-decimal pl-5" : "space-y-3"} text-slate-600`}>
      {items.map((item) => (
        <li key={item} className={ordered ? "pl-1 leading-7" : "flex gap-3 leading-7"}>
          {ordered ? null : <span className="mt-2.5 h-2 w-2 flex-none rounded-full bg-action" />}
          <span>{item}</span>
        </li>
      ))}
    </ListTag>
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
    <article className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-50 bg-blue-50/70 px-6 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-action">Basic AI feedback</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-ink">Gemini CV improvement notes</h3>
          </div>
          <span className="w-fit rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-action">
            Generated on request
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-slate-50 p-5">
          <h4 className="text-sm font-black text-ink">AI Summary</h4>
          <p className="mt-3 leading-7 text-slate-700">{feedback.aiSummary}</p>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <h4 className="text-sm font-black text-ink">Rewritten Summary Suggestion</h4>
          <p className="mt-3 leading-7 text-slate-700">{feedback.rewrittenSummarySuggestion}</p>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <h4 className="text-sm font-black text-ink">Top Three Fixes</h4>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-slate-700">
            {feedback.topThreeFixes?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <h4 className="text-sm font-black text-ink">Improved Bullet Examples</h4>
          <ul className="mt-3 space-y-2 leading-7 text-slate-700">
            {feedback.improvedBulletExamples?.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 h-2 w-2 flex-none rounded-full bg-action" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h4 className="text-sm font-black text-ink">Recruiter Advice</h4>
          <p className="mt-3 leading-7 text-slate-700">{feedback.recruiterAdvice}</p>
        </section>
      </div>
    </article>
  );
}

function ProReportPreview({ report, aiFeedback, isProUnlocked, onUnlock, onLock, actionPlan }) {
  const summaryRewrite = getSummaryRewrite(report, aiFeedback);
  const roleType = getRoleType(report.targetRole);
  const bulletExamples = bulletExamplesByRole[roleType];
  const keywordsForPlacement = [
    ...(report.missingJobKeywords || []),
    ...(report.missingKeywords || []),
  ].filter((keyword, index, allKeywords) => keyword && allKeywords.indexOf(keyword) === index).slice(0, 8);
  const keywordPlacements = keywordsForPlacement.length
    ? keywordsForPlacement.map(getKeywordPlacement)
    : [getKeywordPlacement("Role-specific keyword", 0)];
  const checklist = getChecklist(report);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-200">
              {isProUnlocked ? "Unlocked demo" : "Locked"}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Pro Report Preview</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Unlock deeper CV rewrites, job-tailored improvements, and recruiter-style recommendations.
            </p>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              Demo unlock for testing. Payment will be added later.
            </p>
          </div>
          <div className="max-w-sm rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold leading-6 text-slate-200">
              {isProUnlocked
                ? "This is a demo unlock for MVP testing. In the future, this section will unlock after payment."
                : "Pro is not available yet. Join the waitlist to get notified when it launches."}
            </p>
            <div className="mt-4">
              {isProUnlocked ? (
                <button
                  type="button"
                  onClick={onLock}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Lock Pro Demo Again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onUnlock}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-blue-300 bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Unlock Pro Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {!isProUnlocked ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {proFeatures.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6 10h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                    Locked
                  </span>
                </div>
                <h3 className="mt-5 text-base font-black leading-6 text-ink">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <ProContentCard title="CV Summary Rewrite" className="lg:col-span-2">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-lg font-semibold leading-8">{summaryRewrite.text}</p>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{summaryRewrite.source}</p>
            </ProContentCard>

            <ProContentCard title="Weak Bullet Point Rewrite">
              <ul className="space-y-3">
                {bulletExamples.map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </ProContentCard>

            <ProContentCard title="Job-Tailored Keyword Placement">
              <div className="space-y-3">
                {keywordPlacements.map((item) => (
                  <div key={item.keyword} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-ink">{item.keyword}</span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-action">
                        {item.section}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.advice}</p>
                  </div>
                ))}
              </div>
            </ProContentCard>

            <ProContentCard title="Recruiter-Style Checklist" className="lg:col-span-2">
              <div className="grid gap-3 md:grid-cols-2">
                {checklist.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-black text-ink">{item.label}</h4>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(item.status === "Passed" ? "Good" : item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </ProContentCard>

            <ProContentCard title="Full Improvement Roadmap" className="lg:col-span-2">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  ["Fix Today", actionPlan.fixFirst, "Critical fixes based on your top problems."],
                  ["Improve This Week", actionPlan.improveNext, "Keyword placement, bullet improvements, and section upgrades."],
                  ["Polish Before Applying", actionPlan.niceToHave, "Readability, formatting, proofreading, and role tailoring."],
                ].map(([title, items, description]) => (
                  <div key={title} className="rounded-2xl bg-slate-50 p-5">
                    <h4 className="font-black text-ink">{title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                      {items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-action" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ProContentCard>

            <ProContentCard title="Pro Export Note" className="lg:col-span-2">
              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold leading-6 text-slate-600">
                  Pro PDF export will be connected in a later phase.
                </p>
                <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-500">
                  Future
                </span>
              </div>
            </ProContentCard>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr_0.95fr]">
          <SectionCard title="Free Report" eyebrow="Included now">
            <ListBlock items={freeReportItems} />
          </SectionCard>
          <SectionCard title="Pro Report" eyebrow="Coming soon">
            <ListBlock items={proReportItems} />
          </SectionCard>
          <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6">
            <p className="text-xs font-black uppercase tracking-wider text-action">
              {isProUnlocked ? "Want the real Pro launch?" : "Join the Pro Report Waitlist"}
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-ink">
              {isProUnlocked ? "Join the waitlist" : "Get notified when Pro launches"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Get notified when full CV rewrites, tailored bullet points, and Pro PDF exports launch.
            </p>
            <WaitlistForm source="pro-report" />
          </article>
        </div>
      </div>
    </section>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState(reportData);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState("");

  const actionPlan = report.actionPlan || sampleActionPlan;
  const sectionFeedback = report.sectionFeedback?.length ? report.sectionFeedback : sampleSectionFeedback;
  const atsNotes = report.atsFormattingNotes?.length
    ? report.atsFormattingNotes
    : [
        "Use standard headings like Skills, Experience, Projects, and Education.",
        "Keep contact details as selectable text, not only icons or images.",
        "Use concise bullets so recruiters and ATS tools can scan evidence quickly.",
      ];

  useEffect(() => {
    const storedReport = getStoredReport();

    if (storedReport?.scores?.length) {
      setReport(storedReport);
      setIsGenerated(true);
    }

    try {
      setIsProUnlocked(window.localStorage.getItem(proDemoStorageKey) === "true");
    } catch {
      setIsProUnlocked(false);
    }
  }, []);

  function handleUnlockProDemo() {
    setIsProUnlocked(true);
    try {
      window.localStorage.setItem(proDemoStorageKey, "true");
    } catch {
      // Demo unlock still works for the current session if storage is unavailable.
    }
  }

  function handleLockProDemo() {
    setIsProUnlocked(false);
    try {
      window.localStorage.removeItem(proDemoStorageKey);
    } catch {
      // Nothing else to do if storage is unavailable.
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleClearReport() {
    window.localStorage.removeItem(generatedStorageKey);
    window.localStorage.removeItem(legacyStorageKey);
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
      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-action">
                    Free CV Report
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                    {isGenerated ? "Generated from your uploaded CV" : "Sample report preview"}
                  </span>
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">
                  {isGenerated ? "Your candidate CV report" : "Sample candidate CV report"}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                  You're viewing the free analysis. Pro report options are coming soon.
                </p>
                {!isGenerated ? (
                  <div className="mt-6">
                    <Button href="/analyze">Analyze your CV</Button>
                  </div>
                ) : null}
              </div>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3 lg:min-w-[430px]">
                <Button href="/analyze">Analyze Another CV</Button>
                <Button onClick={handlePrint} variant="secondary">Print / Save Report</Button>
                <Button onClick={handleClearReport} variant="danger">Clear Report</Button>
              </div>
            </div>

            {isGenerated ? (
              <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
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
            ) : null}
          </div>

          <section className="mt-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">Free report section</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">Score Breakdown</h2>
              </div>
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Included in Free
              </span>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {report.scores.map((item) => (
                <ScoreCard key={item.label} {...item} />
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {scoreMeanings.map(([title, description]) => (
                <p key={title} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                  <span className="font-black text-ink">{title}:</span> {description}
                </p>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Executive Summary" eyebrow="Free report section">
              <p className="leading-7 text-slate-600">{report.summary}</p>
            </SectionCard>

            <SectionCard title="ATS Readiness" eyebrow="Free report section">
              <ListBlock items={atsNotes} />
            </SectionCard>

            <SectionCard title="Job Description Match" eyebrow="Free report section" className="lg:col-span-2">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                  {report.hasJobDescription
                    ? "This score compares your CV against the job description you provided."
                    : "No job description was provided. Keyword matching is based on the selected target role or sample role."}
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 lg:min-w-56 lg:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Match score</p>
                  <p className="mt-1 text-3xl font-black text-ink">
                    {report.hasJobDescription ? report.jobDescriptionMatchScore ?? 0 : "-"}
                    {report.hasJobDescription ? <span className="text-base text-slate-500">/100</span> : null}
                  </p>
                </div>
              </div>
              {report.hasJobDescription ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-black text-ink">Matched keywords</h3>
                    <div className="mt-3">
                      <KeywordPills keywords={report.matchedJobKeywords} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-ink">Missing job keywords</h3>
                    <div className="mt-3">
                      <KeywordPills keywords={report.missingJobKeywords} tone="missing" />
                    </div>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard title="CV Strengths" eyebrow="Free report section">
              <ListBlock items={report.topStrengths?.length ? report.topStrengths : ["The CV has enough readable content to generate a basic review."]} />
            </SectionCard>

            <SectionCard title="Top Problems" eyebrow="Free report section">
              <ListBlock items={report.topProblems} ordered />
            </SectionCard>

            <SectionCard title="Missing Keywords" eyebrow="Free report section">
              <KeywordPills keywords={report.missingKeywords} tone="missing" />
            </SectionCard>

            <SectionCard title="Suggested Improvements" eyebrow="Free report section">
              <ListBlock items={report.suggestedImprovements} />
            </SectionCard>

            <SectionCard title="Priority Action Plan" eyebrow="Free report section" className="lg:col-span-2">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  ["Fix first", actionPlan.fixFirst],
                  ["Improve next", actionPlan.improveNext],
                  ["Nice to have", actionPlan.niceToHave],
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
            </SectionCard>

            <SectionCard title="Section-by-Section Feedback" eyebrow="Free report section" className="lg:col-span-2">
              <div className="grid gap-4 md:grid-cols-2">
                {sectionFeedback.map((item) => (
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
            </SectionCard>
          </div>

          <section className="mt-8">
            <SectionCard title="Gemini AI Feedback" eyebrow="Free report section">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                  AI feedback sends your extracted CV/report data to Gemini only when you click this button. This tool gives guidance, not a guaranteed hiring outcome.
                </p>
                <Button onClick={handleGenerateAiFeedback} disabled={isGeneratingFeedback}>
                  {isGeneratingFeedback ? "Generating AI feedback..." : "Generate AI Feedback"}
                </Button>
              </div>
              {aiFeedbackError ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                  {aiFeedbackError}
                </p>
              ) : null}
              <AiFeedbackCard feedback={aiFeedback} />
            </SectionCard>
          </section>

          {isGenerated ? (
            <SectionCard title="Extracted Text Preview" eyebrow="Generated report detail" className="mt-8">
              <p className="max-h-40 overflow-hidden rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {report.extractedTextPreview}
              </p>
            </SectionCard>
          ) : null}

          <ProReportPreview
            report={report}
            aiFeedback={aiFeedback}
            isProUnlocked={isProUnlocked}
            onUnlock={handleUnlockProDemo}
            onLock={handleLockProDemo}
            actionPlan={actionPlan}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
