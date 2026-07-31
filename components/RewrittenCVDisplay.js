"use client";

import { useEffect, useMemo, useState } from "react";

const storageKey = "hireready_rewritten_cv";
const tabs = ["ATS View", "Modern View", "Plain Text View", "Review Notes"];
const placeholderPattern = /\[(?:add|confirm)[^\]]+\]/gi;

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function compactLines(lines) {
  return lines.filter(Boolean).join("\n");
}

function hasItems(items) {
  return asArray(items).length > 0;
}

function contactLines(contact = {}) {
  return [contact.email, contact.phone, contact.location, contact.linkedin, contact.portfolio].filter(Boolean);
}

function headingLine(parts = []) {
  return parts.filter(Boolean).join(" | ");
}

function sectionText(title, body) {
  return body ? `${title}\n${body}` : "";
}

function formatExperience(experience = []) {
  return asArray(experience)
    .map((item) =>
      compactLines([
        headingLine([item.jobTitle, item.company, item.location, item.dates]),
        ...asArray(item.bullets).map((bullet) => `- ${bullet}`),
      ])
    )
    .filter(Boolean)
    .join("\n\n");
}

function formatProjects(projects = []) {
  return asArray(projects)
    .map((item) =>
      compactLines([
        item.projectName,
        item.description,
        ...asArray(item.bullets).map((bullet) => `- ${bullet}`),
      ])
    )
    .filter(Boolean)
    .join("\n\n");
}

function formatEducation(education = []) {
  return asArray(education)
    .map((item) =>
      compactLines([
        headingLine([item.degree, item.institution, item.location, item.dates]),
        ...asArray(item.details).map((detail) => `- ${detail}`),
      ])
    )
    .filter(Boolean)
    .join("\n\n");
}

function buildPlainTextCv(data) {
  const cv = data?.rewrittenCV || {};
  return [
    compactLines([cv.name || "Rewritten CV Draft", ...contactLines(cv.contact)]),
    sectionText("PROFESSIONAL SUMMARY", cv.professionalSummary),
    sectionText("CORE SKILLS", asArray(cv.coreSkills).join(", ")),
    sectionText("EXPERIENCE", formatExperience(cv.experience)),
    sectionText("PROJECTS", formatProjects(cv.projects)),
    sectionText("EDUCATION", formatEducation(cv.education)),
    sectionText("CERTIFICATIONS", asArray(cv.certifications).map((item) => `- ${item}`).join("\n")),
    sectionText("ADDITIONAL SECTIONS", asArray(cv.additionalSections).map((item) => `- ${item}`).join("\n")),
  ].filter((section) => section.trim()).join("\n\n");
}

function fullCvText(data) {
  return buildPlainTextCv(data);
}

function findPlaceholders(data) {
  const matches = JSON.stringify(data || {}).match(placeholderPattern) || [];
  return Array.from(new Set(matches));
}

function HighlightText({ text, className = "" }) {
  const value = String(text || "");
  const parts = value.split(placeholderPattern);
  const matches = value.match(placeholderPattern) || [];

  if (!matches.length) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {matches[index] ? (
            <mark className="rounded-md bg-amber-100 px-1 font-bold text-amber-900 print:bg-white print:text-black">
              {matches[index]}
            </mark>
          ) : null}
        </span>
      ))}
    </span>
  );
}

function CopyButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-ink transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 print:hidden"
    >
      {active ? "Copied" : label}
    </button>
  );
}

function BulletList({ items = [] }) {
  const cleanItems = asArray(items);
  if (!cleanItems.length) return null;

  return (
    <ul className="space-y-2 pl-5 text-sm leading-6 text-slate-700 print:text-black">
      {cleanItems.map((item, index) => (
        <li key={`${item}-${index}`} className="list-disc pl-1">
          <HighlightText text={item} />
        </li>
      ))}
    </ul>
  );
}

function DocumentSection({ title, children }) {
  if (!children) return null;

  return (
    <section className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0 print:border-slate-300">
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 print:text-black">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PanelList({ title, items = [], fallback }) {
  const cleanItems = asArray(items);
  if (!cleanItems.length && !fallback) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 print:border-slate-300 print:p-3">
      <h4 className="font-black text-ink print:text-black">{title}</h4>
      <BulletList items={cleanItems.length ? cleanItems : [fallback]} />
    </section>
  );
}

function getLinkedInAbout(data) {
  const cv = data?.rewrittenCV || {};
  const sellingPoints = asArray(data?.recruiterNotes?.strongestSellingPoints).slice(0, 2).join(" ");
  return compactLines([
    cv.professionalSummary,
    asArray(cv.coreSkills).length ? `Core skills include ${asArray(cv.coreSkills).slice(0, 8).join(", ")}.` : "",
    data?.targetRoleFitSummary,
    sellingPoints,
  ]).replace(/\n/g, " ");
}

function getApplicationEmail(data) {
  const cv = data?.rewrittenCV || {};
  const role = data?.cvTitle?.replace(/rewritten|ats|cv|draft/gi, "").trim() || "the role";
  const name = cv.name || "[Name]";
  const summary = cv.professionalSummary || "relevant experience and skills";

  return `Subject: Application for ${role}

Dear Hiring Team,

I am writing to apply for the ${role} position. My background includes ${summary} I have attached my CV for your review and would welcome the opportunity to discuss how my skills align with the role.

Kind regards,
${name}`;
}

function qualityChecklist(data, placeholders) {
  const cv = data?.rewrittenCV || {};
  return [
    ["ATS-safe layout", true],
    ["Clear professional summary", Boolean(cv.professionalSummary)],
    ["Skills section included", hasItems(cv.coreSkills)],
    ["Experience bullets improved", asArray(cv.experience).some((item) => hasItems(item.bullets))],
    ["Job keywords included naturally", hasItems(data?.atsOptimizationNotes?.keywordsAddedNaturally)],
    ["Placeholder review needed", placeholders.length === 0],
    ["Ready for human review", true],
  ];
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-action focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-action focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function printRewrittenCv() {
  const printDocument = document.querySelector("[data-print-area='rewritten-cv']");

  if (!printDocument) {
    alert("Could not find the rewritten CV document to print.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) {
    alert("Could not open the print window. Please allow pop-ups and try again.");
    return;
  }

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>Rewritten CV</title>
    <style>
      @page {
        size: A4;
        margin: 12mm 14mm;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10.5pt;
        line-height: 1.35;
      }

      body {
        width: 100%;
      }

      .ats-cv-print-document {
        display: block;
        width: 100%;
        max-width: 190mm;
        margin: 0 auto;
        padding: 0;
        background: #ffffff;
        color: #111827;
        box-shadow: none;
        border: none;
        border-radius: 0;
      }

      h1 {
        font-size: 18pt;
        line-height: 1.1;
        margin: 0 0 4px 0;
        font-weight: 700;
      }

      h2 {
        font-size: 10.5pt;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 12px 0 5px 0;
        padding-bottom: 3px;
        border-bottom: 1px solid #9ca3af;
        font-weight: 700;
      }

      h3 {
        font-size: 10.5pt;
        margin: 6px 0 2px 0;
        font-weight: 700;
      }

      p {
        margin: 0 0 5px 0;
      }

      ul {
        margin: 3px 0 7px 18px;
        padding: 0;
      }

      li {
        margin: 0 0 2px 0;
      }

      .ats-cv-print-section,
      .ats-cv-print-entry {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .no-print,
      button,
      nav,
      footer {
        display: none !important;
      }
    </style>
  </head>
  <body>
    ${printDocument.outerHTML}
  </body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => printWindow.close();
  window.setTimeout(() => {
    printWindow.print();
  }, 150);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function docxText(TextRun, text, options = {}) {
  return new TextRun({
    text: String(text || ""),
    font: "Arial",
    size: options.size || 22,
    bold: options.bold || false,
  });
}

function docxParagraph(Paragraph, TextRun, text, options = {}) {
  return new Paragraph({
    children: [docxText(TextRun, text, options)],
    spacing: {
      before: options.before || 0,
      after: options.after ?? 120,
    },
    alignment: options.alignment,
    heading: options.heading,
    bullet: options.bullet,
  });
}

function docxSectionHeading({ HeadingLevel, Paragraph, TextRun }, title) {
  return new Paragraph({
    children: [docxText(TextRun, title.toUpperCase(), { bold: true, size: 22 })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    border: {
      bottom: {
        color: "9CA3AF",
        space: 1,
        style: "single",
        size: 6,
      },
    },
  });
}

function appendDocxSection(children, docxApi, title, content) {
  if (!content?.length) return;
  children.push(docxSectionHeading(docxApi, title), ...content);
}

function buildDocxChildren(data, docxApi) {
  const { AlignmentType, Paragraph, TextRun } = docxApi;
  const cv = data?.rewrittenCV || {};
  const children = [
    new Paragraph({
      children: [docxText(TextRun, cv.name || "Rewritten CV Draft", { bold: true, size: 34 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
  ];
  const contacts = contactLines(cv.contact);
  if (contacts.length) {
    children.push(docxParagraph(Paragraph, TextRun, contacts.join(" | "), { alignment: AlignmentType.CENTER, size: 20, after: 180 }));
  }

  appendDocxSection(
    children,
    docxApi,
    "Professional Summary",
    cv.professionalSummary ? [docxParagraph(Paragraph, TextRun, cv.professionalSummary)] : []
  );
  appendDocxSection(
    children,
    docxApi,
    "Core Skills",
    hasItems(cv.coreSkills) ? [docxParagraph(Paragraph, TextRun, asArray(cv.coreSkills).join(", "))] : []
  );
  appendDocxSection(
    children,
    docxApi,
    "Experience",
    asArray(cv.experience).flatMap((item) => [
      headingLine([item.jobTitle, item.company]) ? docxParagraph(Paragraph, TextRun, headingLine([item.jobTitle, item.company]), { bold: true, after: 40 }) : null,
      headingLine([item.location, item.dates]) ? docxParagraph(Paragraph, TextRun, headingLine([item.location, item.dates]), { size: 20, after: 60 }) : null,
      ...asArray(item.bullets).map((bullet) => docxParagraph(Paragraph, TextRun, bullet, { bullet: { level: 0 }, after: 60 })),
    ].filter(Boolean))
  );
  appendDocxSection(
    children,
    docxApi,
    "Projects",
    asArray(cv.projects).flatMap((item) => [
      item.projectName ? docxParagraph(Paragraph, TextRun, item.projectName, { bold: true, after: 40 }) : null,
      item.description ? docxParagraph(Paragraph, TextRun, item.description, { after: 60 }) : null,
      ...asArray(item.bullets).map((bullet) => docxParagraph(Paragraph, TextRun, bullet, { bullet: { level: 0 }, after: 60 })),
    ].filter(Boolean))
  );
  appendDocxSection(
    children,
    docxApi,
    "Education",
    asArray(cv.education).flatMap((item) => [
      headingLine([item.degree, item.institution]) ? docxParagraph(Paragraph, TextRun, headingLine([item.degree, item.institution]), { bold: true, after: 40 }) : null,
      headingLine([item.location, item.dates]) ? docxParagraph(Paragraph, TextRun, headingLine([item.location, item.dates]), { size: 20, after: 60 }) : null,
      ...asArray(item.details).map((detail) => docxParagraph(Paragraph, TextRun, detail, { bullet: { level: 0 }, after: 60 })),
    ].filter(Boolean))
  );
  appendDocxSection(
    children,
    docxApi,
    "Certifications",
    asArray(cv.certifications).map((item) => docxParagraph(Paragraph, TextRun, item, { bullet: { level: 0 }, after: 60 }))
  );
  appendDocxSection(
    children,
    docxApi,
    "Additional Sections",
    asArray(cv.additionalSections).map((item) => docxParagraph(Paragraph, TextRun, item, { bullet: { level: 0 }, after: 60 }))
  );

  return children;
}

async function buildDocxBlob(data) {
  const docxApi = await import("docx");
  const { Document, Packer } = docxApi;
  const doc = new Document({
    creator: "HireReady CV",
    description: "ATS-friendly rewritten CV draft",
    title: "HireReady Rewritten CV",
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22,
            color: "111827",
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 820,
              bottom: 720,
              left: 820,
            },
          },
        },
        children: buildDocxChildren(data, docxApi),
      },
    ],
  });

  return Packer.toBlob(doc);
}

export default function RewrittenCVDisplay({ rewrittenCvData, onClear }) {
  const [activeTab, setActiveTab] = useState("ATS View");
  const [copiedKey, setCopiedKey] = useState("");
  const [draft, setDraft] = useState(rewrittenCvData);
  const [editDraft, setEditDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    setDraft(rewrittenCvData);
    setEditDraft(null);
    setIsEditing(false);
  }, [rewrittenCvData]);

  const data = isEditing ? editDraft : draft;
  const cv = data?.rewrittenCV || {};
  const placeholders = useMemo(() => findPlaceholders(data), [data]);
  const plainText = useMemo(() => fullCvText(data), [data]);
  const linkedInAbout = useMemo(() => getLinkedInAbout(data), [data]);
  const applicationEmail = useMemo(() => getApplicationEmail(data), [data]);
  const warnings = [
    ...asArray(data?.atsOptimizationNotes?.truthfulnessWarnings),
    ...asArray(data?.changeSummary?.placeholdersToFill),
    ...asArray(data?.changeSummary?.whatNeedsUserConfirmation),
    ...placeholders,
  ];
  const improvementFallback =
    "The draft improves clarity, ATS formatting, keyword placement, and recruiter readability based on the uploaded CV and selected role.";

  if (!data) return null;

  function updateCv(updater) {
    setEditDraft((current) => {
      const next = cloneData(current);
      next.rewrittenCV = next.rewrittenCV || {};
      updater(next.rewrittenCV, next);
      return next;
    });
  }

  async function copyText(key, text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  }

  function downloadTxt() {
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${(cv.name || "rewritten-cv").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-draft.txt`);
  }

  async function downloadDocx() {
    setExportError("");
    try {
      const blob = await buildDocxBlob(data);
      downloadBlob(blob, "hireready-rewritten-cv.docx");
    } catch (error) {
      console.error("DOCX export failed:", error);
      setExportError("Could not generate DOCX. Please try again.");
    }
  }

  function startEditing() {
    setEditDraft(cloneData(draft));
    setIsEditing(true);
  }

  function saveEdits() {
    setDraft(editDraft);
    setIsEditing(false);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(editDraft));
    } catch {
      // Edited draft still stays visible for this session.
    }
  }

  function cancelEditing() {
    setEditDraft(null);
    setIsEditing(false);
  }

  return (
    <>
    <article className="no-print rewritten-cv-workspace rounded-3xl border border-blue-100 bg-slate-50 p-4 shadow-sm sm:p-6 lg:col-span-2">
      <header className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                ATS-friendly draft
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-action">
                Pro demo
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-ink">Pro CV Rewrite Workspace</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Review, edit, copy, and export your rewritten ATS-friendly CV draft.
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Review and personalize all rewritten content before applying.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 lg:max-w-sm">
            <p className="font-black text-ink">{cv.name || "Rewritten CV Draft"}</p>
            {data.targetRoleFitSummary ? <p className="mt-2">{data.targetRoleFitSummary}</p> : null}
            <p className="mt-2 font-semibold text-slate-500">Restored from saved draft when available.</p>
          </div>
        </div>
      </header>

      <div className="sticky top-3 z-10 mb-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur print:hidden">
        <div className="flex flex-wrap gap-2">
          <CopyButton label="Copy Full CV" active={copiedKey === "full"} onClick={() => copyText("full", plainText)} />
          <CopyButton label="Copy Summary" active={copiedKey === "summary"} onClick={() => copyText("summary", cv.professionalSummary || "")} />
          <CopyButton label="Copy Skills" active={copiedKey === "skills"} onClick={() => copyText("skills", asArray(cv.coreSkills).join(", "))} />
          <CopyButton label="Copy Experience" active={copiedKey === "experience"} onClick={() => copyText("experience", formatExperience(cv.experience))} />
          <CopyButton label="Copy Projects" active={copiedKey === "projects"} onClick={() => copyText("projects", formatProjects(cv.projects))} />
          <CopyButton label="Copy LinkedIn About" active={copiedKey === "linkedin"} onClick={() => copyText("linkedin", linkedInAbout)} />
          <CopyButton label="Copy Application Email" active={copiedKey === "email"} onClick={() => copyText("email", applicationEmail)} />
          <button type="button" onClick={downloadTxt} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-ink transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
            Download TXT
          </button>
          <button type="button" onClick={downloadDocx} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-ink transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
            Download DOCX
          </button>
          <button type="button" onClick={printRewrittenCv} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-action transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
            Save as PDF
          </button>
          <button type="button" onClick={printRewrittenCv} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
            Print Rewritten CV
          </button>
          {isEditing ? (
            <>
              <button type="button" onClick={saveEdits} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2">
                Save Edits
              </button>
              <button type="button" onClick={cancelEditing} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
                Cancel Editing
              </button>
            </>
          ) : (
            <button type="button" onClick={startEditing} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-action transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
              Edit Draft
            </button>
          )}
          <button type="button" onClick={onClear} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2">
            Clear Rewritten CV
          </button>
        </div>
        {isEditing ? <p className="mt-3 text-xs font-semibold text-slate-500">Edits are saved in your browser for this MVP.</p> : null}
        <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
          DOCX is editable. PDF uses your browser's Save as PDF option. Print output uses an ATS-safe layout with no graphics, tables, or columns.
        </p>
        {exportError ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
            {exportError}
          </p>
        ) : null}
      </div>

      {placeholders.length ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900 print:hidden">
          This draft contains placeholders that must be replaced before applying.
        </div>
      ) : null}

      <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`min-h-10 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-black transition ${
              activeTab === tab ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Plain Text View" ? (
        <PlainTextView plainText={plainText} linkedInAbout={linkedInAbout} applicationEmail={applicationEmail} onCopy={copyText} copiedKey={copiedKey} />
      ) : activeTab === "Review Notes" ? (
        <ReviewNotes data={data} placeholders={placeholders} warnings={warnings} fallback={improvementFallback} linkedInAbout={linkedInAbout} applicationEmail={applicationEmail} onCopy={copyText} copiedKey={copiedKey} />
      ) : (
        <>
          {isEditing ? (
            <EditWorkspace data={editDraft} updateCv={updateCv} />
          ) : activeTab === "Modern View" ? (
            <ModernDocument data={data} placeholders={placeholders} />
          ) : (
            <AtsDocument data={data} />
          )}
          <WorkspaceSidePanels data={data} warnings={warnings} fallback={improvementFallback} placeholders={placeholders} />
        </>
      )}
    </article>
    <PrintableAtsDocument data={data} />
    </>
  );
}

function PrintableAtsDocument({ data }) {
  const cv = data?.rewrittenCV || {};
  const contacts = contactLines(cv.contact);

  return (
    <article className="ats-cv-print-document" data-print-area="rewritten-cv">
      <header>
        <h1>{cv.name || "Rewritten CV Draft"}</h1>
        {contacts.length ? <p className="ats-cv-print-contact">{contacts.join(" | ")}</p> : null}
      </header>

      {cv.professionalSummary ? (
        <section className="ats-cv-print-section">
          <h2>Professional Summary</h2>
          <p>{cv.professionalSummary}</p>
        </section>
      ) : null}

      {hasItems(cv.coreSkills) ? (
        <section className="ats-cv-print-section">
          <h2>Core Skills</h2>
          <p>{asArray(cv.coreSkills).join(", ")}</p>
        </section>
      ) : null}

      {hasItems(cv.experience) ? (
        <section className="ats-cv-print-section">
          <h2>Experience</h2>
          {asArray(cv.experience).map((item, index) => (
            <div key={`${item.jobTitle || "experience"}-${index}`} className="ats-cv-print-entry">
              {headingLine([item.jobTitle, item.company]) ? <p><strong>{headingLine([item.jobTitle, item.company])}</strong></p> : null}
              {headingLine([item.location, item.dates]) ? <p>{headingLine([item.location, item.dates])}</p> : null}
              <PrintBulletList items={item.bullets} />
            </div>
          ))}
        </section>
      ) : null}

      {hasItems(cv.projects) ? (
        <section className="ats-cv-print-section">
          <h2>Projects</h2>
          {asArray(cv.projects).map((item, index) => (
            <div key={`${item.projectName || "project"}-${index}`} className="ats-cv-print-entry">
              {item.projectName ? <p><strong>{item.projectName}</strong></p> : null}
              {item.description ? <p>{item.description}</p> : null}
              <PrintBulletList items={item.bullets} />
            </div>
          ))}
        </section>
      ) : null}

      {hasItems(cv.education) ? (
        <section className="ats-cv-print-section">
          <h2>Education</h2>
          {asArray(cv.education).map((item, index) => (
            <div key={`${item.degree || "education"}-${index}`} className="ats-cv-print-entry">
              {headingLine([item.degree, item.institution]) ? <p><strong>{headingLine([item.degree, item.institution])}</strong></p> : null}
              {headingLine([item.location, item.dates]) ? <p>{headingLine([item.location, item.dates])}</p> : null}
              <PrintBulletList items={item.details} />
            </div>
          ))}
        </section>
      ) : null}

      {hasItems(cv.certifications) ? (
        <section className="ats-cv-print-section">
          <h2>Certifications</h2>
          <PrintBulletList items={cv.certifications} />
        </section>
      ) : null}

      {hasItems(cv.additionalSections) ? (
        <section className="ats-cv-print-section">
          <h2>Additional Sections</h2>
          <PrintBulletList items={cv.additionalSections} />
        </section>
      ) : null}
    </article>
  );
}

function PrintBulletList({ items = [] }) {
  const cleanItems = asArray(items);
  if (!cleanItems.length) return null;

  return (
    <ul>
      {cleanItems.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function AtsDocument({ data }) {
  const cv = data?.rewrittenCV || {};
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 print:border-0 print:p-0 print:shadow-none">
      <CvHeader data={data} />
      <div className="mt-6 space-y-6">
        <CvSections cv={cv} />
      </div>
    </div>
  );
}

function ModernDocument({ data }) {
  const cv = data?.rewrittenCV || {};
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
      <CvHeader data={data} modern />
      <div className="mt-6 grid gap-5">
        <CvSections cv={cv} modern />
      </div>
    </div>
  );
}

function CvHeader({ data, modern = false }) {
  const cv = data?.rewrittenCV || {};
  const contacts = contactLines(cv.contact);
  return (
    <header className={`${modern ? "rounded-2xl bg-slate-950 p-5 text-white" : "border-b border-slate-200 pb-6"} print:border-b print:border-slate-300 print:bg-white print:text-black`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={`text-3xl font-black tracking-tight ${modern ? "text-white print:text-black" : "text-ink print:text-black"}`}>
            {cv.name || "Rewritten CV Draft"}
          </h3>
          {data.targetRoleFitSummary ? (
            <p className={`mt-3 max-w-3xl text-sm leading-6 ${modern ? "text-slate-300 print:text-black" : "text-slate-600 print:text-black"}`}>
              {data.targetRoleFitSummary}
            </p>
          ) : null}
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${modern ? "bg-white/10 text-white print:text-black" : "border border-emerald-200 bg-emerald-50 text-emerald-700 print:border-black print:bg-white print:text-black"}`}>
          ATS-friendly draft
        </span>
      </div>
      {contacts.length ? (
        <p className={`mt-5 text-sm font-semibold leading-6 ${modern ? "text-slate-200 print:text-black" : "text-slate-700 print:text-black"}`}>
          {contacts.join(" | ")}
        </p>
      ) : null}
    </header>
  );
}

function CvSections({ cv, modern = false }) {
  const wrapperClass = modern ? "rounded-2xl border border-slate-200 bg-slate-50 p-5" : "";
  return (
    <>
      {cv.professionalSummary ? (
        <DocumentSection title="Professional Summary">
          <div className={wrapperClass}>
            <p className="leading-7 text-slate-700 print:text-black"><HighlightText text={cv.professionalSummary} /></p>
          </div>
        </DocumentSection>
      ) : null}
      {hasItems(cv.coreSkills) ? (
        <DocumentSection title="Core Skills">
          <div className="flex flex-wrap gap-2">
            {asArray(cv.coreSkills).map((skill) => (
              <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 print:border-0 print:bg-white print:px-0 print:py-0 print:font-normal print:text-black">
                <HighlightText text={skill} />
              </span>
            ))}
          </div>
        </DocumentSection>
      ) : null}
      {hasItems(cv.experience) ? (
        <DocumentSection title="Experience">
          <div className="space-y-5">
            {asArray(cv.experience).map((item, index) => (
              <div key={`${item.jobTitle || "experience"}-${index}`} className={wrapperClass}>
                <p className="font-black text-ink print:text-black">{headingLine([item.jobTitle, item.company])}</p>
                {headingLine([item.location, item.dates]) ? <p className="mt-1 text-sm font-semibold text-slate-500 print:text-black">{headingLine([item.location, item.dates])}</p> : null}
                <div className="mt-3"><BulletList items={item.bullets} /></div>
              </div>
            ))}
          </div>
        </DocumentSection>
      ) : null}
      {hasItems(cv.projects) ? (
        <DocumentSection title="Projects">
          <div className="space-y-5">
            {asArray(cv.projects).map((item, index) => (
              <div key={`${item.projectName || "project"}-${index}`} className={wrapperClass}>
                {item.projectName ? <p className="font-black text-ink print:text-black">{item.projectName}</p> : null}
                {item.description ? <p className="mt-1 text-sm leading-6 text-slate-600 print:text-black"><HighlightText text={item.description} /></p> : null}
                <div className="mt-3"><BulletList items={item.bullets} /></div>
              </div>
            ))}
          </div>
        </DocumentSection>
      ) : null}
      {hasItems(cv.education) ? (
        <DocumentSection title="Education">
          <div className="space-y-5">
            {asArray(cv.education).map((item, index) => (
              <div key={`${item.degree || "education"}-${index}`} className={wrapperClass}>
                <p className="font-black text-ink print:text-black">{headingLine([item.degree, item.institution])}</p>
                {headingLine([item.location, item.dates]) ? <p className="mt-1 text-sm font-semibold text-slate-500 print:text-black">{headingLine([item.location, item.dates])}</p> : null}
                <div className="mt-3"><BulletList items={item.details} /></div>
              </div>
            ))}
          </div>
        </DocumentSection>
      ) : null}
      {hasItems(cv.certifications) ? <DocumentSection title="Certifications"><BulletList items={cv.certifications} /></DocumentSection> : null}
      {hasItems(cv.additionalSections) ? <DocumentSection title="Additional Sections"><BulletList items={cv.additionalSections} /></DocumentSection> : null}
    </>
  );
}

function PlainTextView({ plainText, linkedInAbout, applicationEmail, onCopy, copiedKey }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-ink">Plain Text View</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Use this for job portals, LinkedIn forms, or ATS text fields.</p>
        </div>
        <CopyButton label="Copy Plain Text" active={copiedKey === "plain"} onClick={() => onCopy("plain", plainText)} />
      </div>
      <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-white">{plainText}</pre>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <HelperCard title="LinkedIn About Draft" text={linkedInAbout} button="Copy LinkedIn About" copied={copiedKey === "linkedin-inline"} onCopy={() => onCopy("linkedin-inline", linkedInAbout)} />
        <HelperCard title="Short Application Email Draft" text={applicationEmail} button="Copy Application Email" copied={copiedKey === "email-inline"} onCopy={() => onCopy("email-inline", applicationEmail)} />
      </div>
    </div>
  );
}

function HelperCard({ title, text, button, copied, onCopy }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-black text-ink">{title}</h4>
        <CopyButton label={button} active={copied} onClick={onCopy} />
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text}</p>
    </section>
  );
}

function ReviewNotes({ data, placeholders, warnings, fallback, linkedInAbout, applicationEmail, onCopy, copiedKey }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <PanelList title="What improved" items={data?.changeSummary?.whatImproved} fallback={fallback} />
      <PanelList title="Keywords added naturally" items={data?.atsOptimizationNotes?.keywordsAddedNaturally} />
      <PanelList title="Formatting improvements" items={data?.atsOptimizationNotes?.formattingImprovements} />
      <PanelList title="Strongest selling points" items={data?.recruiterNotes?.strongestSellingPoints} />
      <PanelList title="Remaining weaknesses" items={data?.recruiterNotes?.remainingWeaknesses} />
      <PanelList title="Before applying checklist" items={data?.recruiterNotes?.beforeApplyingChecklist} />
      <PanelList title="Truthfulness warnings" items={warnings} fallback="Review the rewritten CV carefully and make sure every detail is accurate before applying." />
      <PanelList title="Detected placeholders" items={placeholders} />
      <QualityChecklist data={data} placeholders={placeholders} />
      <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
        <HelperCard title="LinkedIn About Draft" text={linkedInAbout} button="Copy LinkedIn About" copied={copiedKey === "linkedin-review"} onCopy={() => onCopy("linkedin-review", linkedInAbout)} />
        <HelperCard title="Short Application Email Draft" text={applicationEmail} button="Copy Application Email" copied={copiedKey === "email-review"} onCopy={() => onCopy("email-review", applicationEmail)} />
      </div>
    </div>
  );
}

function QualityChecklist({ data, placeholders }) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
      <h4 className="text-lg font-black text-ink">Rewrite Quality Checklist</h4>
      <div className="mt-4 grid gap-3">
        {qualityChecklist(data, placeholders).map(([label, passed]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
            <span className="text-sm font-bold text-slate-700">{label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
              {passed ? "Passed" : "Needs review"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkspaceSidePanels({ data, warnings, fallback, placeholders }) {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2 print:hidden">
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h4 className="text-lg font-black text-amber-950">Before using this CV</h4>
        <BulletList items={warnings.length ? warnings : ["Review the rewritten CV carefully and make sure every detail is accurate before applying."]} />
        <p className="mt-4 text-sm font-bold leading-6 text-amber-900">
          Do not add skills, tools, results, or experience you cannot honestly support.
        </p>
      </aside>
      <aside className="rounded-2xl border border-blue-100 bg-white p-5">
        <h4 className="text-lg font-black text-ink">What improved</h4>
        <BulletList
          items={[
            ...asArray(data?.changeSummary?.whatImproved),
            ...asArray(data?.atsOptimizationNotes?.formattingImprovements),
            ...asArray(data?.atsOptimizationNotes?.keywordsAddedNaturally),
            ...asArray(data?.recruiterNotes?.strongestSellingPoints),
          ].slice(0, 8)}
        />
        {!asArray(data?.changeSummary?.whatImproved).length ? <p className="mt-3 text-sm leading-6 text-slate-600">{fallback}</p> : null}
        {placeholders.length ? <p className="mt-4 text-sm font-semibold text-amber-800">Detected placeholders: {placeholders.join(", ")}</p> : null}
      </aside>
    </div>
  );
}

function EditWorkspace({ data, updateCv }) {
  const cv = data?.rewrittenCV || {};
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-ink">Edit Draft</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Keep edits factual and replace placeholders with your real details.</p>
      <div className="mt-5 grid gap-5">
        <TextInput label="Name" value={cv.name} onChange={(value) => updateCv((next) => { next.name = value; })} />
        <TextArea label="Professional Summary" value={cv.professionalSummary} onChange={(value) => updateCv((next) => { next.professionalSummary = value; })} rows={5} />
        <TextArea label="Core Skills" value={asArray(cv.coreSkills).join("\n")} onChange={(value) => updateCv((next) => { next.coreSkills = splitLines(value); })} rows={5} />
        {asArray(cv.experience).map((item, index) => (
          <div key={`edit-exp-${index}`} className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-ink">Experience {index + 1}</p>
            <TextArea label="Bullets" value={asArray(item.bullets).join("\n")} onChange={(value) => updateCv((next) => { next.experience[index].bullets = splitLines(value); })} rows={5} />
          </div>
        ))}
        {asArray(cv.projects).map((item, index) => (
          <div key={`edit-project-${index}`} className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-ink">Project {index + 1}</p>
            <TextArea label="Description" value={item.description} onChange={(value) => updateCv((next) => { next.projects[index].description = value; })} rows={3} />
            <TextArea label="Bullets" value={asArray(item.bullets).join("\n")} onChange={(value) => updateCv((next) => { next.projects[index].bullets = splitLines(value); })} rows={4} />
          </div>
        ))}
        {hasItems(cv.education) ? <TextArea label="Education Details" value={asArray(cv.education?.[0]?.details).join("\n")} onChange={(value) => updateCv((next) => { next.education[0].details = splitLines(value); })} rows={4} /> : null}
        {hasItems(cv.certifications) ? <TextArea label="Certifications" value={asArray(cv.certifications).join("\n")} onChange={(value) => updateCv((next) => { next.certifications = splitLines(value); })} rows={4} /> : null}
        {hasItems(cv.additionalSections) ? <TextArea label="Additional Sections" value={asArray(cv.additionalSections).join("\n")} onChange={(value) => updateCv((next) => { next.additionalSections = splitLines(value); })} rows={4} /> : null}
      </div>
    </div>
  );
}
