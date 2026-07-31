import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MODEL = "gemini-3.5-flash";

function compactText(value, maxLength = 1200) {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function safeArray(value, maxItems = 12) {
  return Array.isArray(value) ? value.slice(0, maxItems) : [];
}

function stripCodeFence(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractJsonText(text) {
  const cleanedText = stripCodeFence(text);
  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return cleanedText;
  }

  return cleanedText.slice(firstBrace, lastBrace + 1);
}

function normalizeStringArray(value, maxItems = 12, maxLength = 220) {
  return safeArray(value, maxItems)
    .map((item) => compactText(item, maxLength))
    .filter(Boolean);
}

function normalizeEntryList(value, fields, maxItems = 6) {
  return safeArray(value, maxItems).map((item) => {
    const entry = {};
    fields.forEach((field) => {
      entry[field] = field === "bullets" || field === "details"
        ? normalizeStringArray(item?.[field], 8, 260)
        : compactText(item?.[field], 180);
    });
    return entry;
  });
}

function normalizeRewrite(rawRewrite) {
  const rewrittenCV = rawRewrite?.rewrittenCV || {};
  const contact = rewrittenCV?.contact || {};
  const atsOptimizationNotes = rawRewrite?.atsOptimizationNotes || {};
  const recruiterNotes = rawRewrite?.recruiterNotes || {};
  const changeSummary = rawRewrite?.changeSummary || {};

  return {
    cvTitle: compactText(rawRewrite?.cvTitle, 180) || "Rewritten ATS CV Draft",
    targetRoleFitSummary: compactText(rawRewrite?.targetRoleFitSummary, 900),
    rewrittenCV: {
      name: compactText(rewrittenCV?.name, 140),
      contact: {
        email: compactText(contact?.email, 120),
        phone: compactText(contact?.phone, 80),
        location: compactText(contact?.location, 120),
        linkedin: compactText(contact?.linkedin, 180),
        portfolio: compactText(contact?.portfolio, 180),
      },
      professionalSummary: compactText(rewrittenCV?.professionalSummary, 900),
      coreSkills: normalizeStringArray(rewrittenCV?.coreSkills, 18, 90),
      experience: normalizeEntryList(
        rewrittenCV?.experience,
        ["jobTitle", "company", "location", "dates", "bullets"],
        6
      ),
      projects: normalizeEntryList(
        rewrittenCV?.projects,
        ["projectName", "description", "bullets"],
        6
      ),
      education: normalizeEntryList(
        rewrittenCV?.education,
        ["degree", "institution", "location", "dates", "details"],
        5
      ),
      certifications: normalizeStringArray(rewrittenCV?.certifications, 10, 180),
      additionalSections: normalizeStringArray(rewrittenCV?.additionalSections, 10, 260),
    },
    atsOptimizationNotes: {
      keywordsAddedNaturally: normalizeStringArray(atsOptimizationNotes?.keywordsAddedNaturally, 14, 90),
      keywordsStillMissing: normalizeStringArray(atsOptimizationNotes?.keywordsStillMissing, 14, 90),
      formattingImprovements: normalizeStringArray(atsOptimizationNotes?.formattingImprovements, 8, 240),
      truthfulnessWarnings: normalizeStringArray(atsOptimizationNotes?.truthfulnessWarnings, 8, 260),
    },
    recruiterNotes: {
      strongestSellingPoints: normalizeStringArray(recruiterNotes?.strongestSellingPoints, 8, 240),
      remainingWeaknesses: normalizeStringArray(recruiterNotes?.remainingWeaknesses, 8, 240),
      beforeApplyingChecklist: normalizeStringArray(recruiterNotes?.beforeApplyingChecklist, 8, 240),
    },
    changeSummary: {
      whatImproved: normalizeStringArray(changeSummary?.whatImproved, 8, 240),
      whatNeedsUserConfirmation: normalizeStringArray(changeSummary?.whatNeedsUserConfirmation, 8, 260),
      placeholdersToFill: normalizeStringArray(changeSummary?.placeholdersToFill, 8, 220),
    },
  };
}

function makeFallbackRewrite(responseText) {
  const cleanedText = stripCodeFence(responseText);

  return normalizeRewrite({
    cvTitle: "Rewritten ATS CV Draft",
    targetRoleFitSummary:
      "Gemini returned a CV rewrite, but it was not formatted as clean JSON. Review the raw draft below before using it.",
    rewrittenCV: {
      name: "[Add name]",
      contact: {
        email: "[Add email]",
        phone: "[Add phone]",
        location: "[Add location]",
        linkedin: "",
        portfolio: "",
      },
      professionalSummary: cleanedText || "Gemini returned an empty draft. Please try again.",
      coreSkills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      additionalSections: [],
    },
    atsOptimizationNotes: {
      truthfulnessWarnings: [
        "The raw Gemini response could not be parsed into structured sections. Review every line carefully.",
      ],
    },
    changeSummary: {
      placeholdersToFill: ["[Add missing detail]"],
      whatNeedsUserConfirmation: ["Confirm all facts before using this draft."],
    },
  });
}

function buildPrompt({
  originalCvText,
  targetRole,
  country,
  experienceLevel,
  jobDescription,
  reportData,
  aiFeedback,
}) {
  const payload = {
    originalCvText: compactText(originalCvText, 18000),
    targetRole: compactText(targetRole, 160),
    country: compactText(country, 80),
    experienceLevel: compactText(experienceLevel, 80),
    jobDescription: compactText(jobDescription, 5000),
    reportData: {
      summary: compactText(reportData?.summary, 900),
      scores: safeArray(reportData?.scores, 8),
      topProblems: safeArray(reportData?.topProblems, 8),
      topStrengths: safeArray(reportData?.topStrengths, 8),
      suggestedImprovements: safeArray(reportData?.suggestedImprovements, 8),
      missingKeywords: safeArray(reportData?.missingKeywords, 20),
      matchedJobKeywords: safeArray(reportData?.matchedJobKeywords, 20),
      missingJobKeywords: safeArray(reportData?.missingJobKeywords, 20),
      sectionFeedback: safeArray(reportData?.sectionFeedback, 10),
      actionPlan: reportData?.actionPlan || null,
    },
    aiFeedback: aiFeedback
      ? {
          aiSummary: compactText(aiFeedback?.aiSummary, 900),
          rewrittenSummarySuggestion: compactText(aiFeedback?.rewrittenSummarySuggestion, 900),
          topThreeFixes: safeArray(aiFeedback?.topThreeFixes, 5),
          improvedBulletExamples: safeArray(aiFeedback?.improvedBulletExamples, 6),
          recruiterAdvice: compactText(aiFeedback?.recruiterAdvice, 900),
        }
      : null,
  };

  return `You are an expert ATS CV writer, recruiter, and career coach.

Rewrite the candidate's CV into a professional ATS-friendly draft tailored to the target role and job description.

Critical rules:
- Do not invent fake experience.
- Do not invent companies, dates, certificates, degrees, numbers, tools, or skills.
- Only use facts found in the original CV text or strongly supported by it.
- If something is missing, use placeholders such as [Add measurable result here] or [Add missing detail].
- Keep the CV ATS-friendly.
- No tables.
- No columns.
- No graphics.
- No emojis.
- No icons.
- Use clear headings.
- Use concise bullets.
- Use job-description keywords naturally, not artificially.
- Make it suitable for students, juniors, fresh graduates, and early-career applicants.
- The output should feel written by a professional CV writer.
- Return only valid JSON. Do not include markdown, commentary, or code fences.

Return this exact JSON shape:
{
  "cvTitle": "",
  "targetRoleFitSummary": "",
  "rewrittenCV": {
    "name": "",
    "contact": {
      "email": "",
      "phone": "",
      "location": "",
      "linkedin": "",
      "portfolio": ""
    },
    "professionalSummary": "",
    "coreSkills": [],
    "experience": [
      {
        "jobTitle": "",
        "company": "",
        "location": "",
        "dates": "",
        "bullets": []
      }
    ],
    "projects": [
      {
        "projectName": "",
        "description": "",
        "bullets": []
      }
    ],
    "education": [
      {
        "degree": "",
        "institution": "",
        "location": "",
        "dates": "",
        "details": []
      }
    ],
    "certifications": [],
    "additionalSections": []
  },
  "atsOptimizationNotes": {
    "keywordsAddedNaturally": [],
    "keywordsStillMissing": [],
    "formattingImprovements": [],
    "truthfulnessWarnings": []
  },
  "recruiterNotes": {
    "strongestSellingPoints": [],
    "remainingWeaknesses": [],
    "beforeApplyingChecklist": []
  },
  "changeSummary": {
    "whatImproved": [],
    "whatNeedsUserConfirmation": [],
    "placeholdersToFill": []
  }
}

Input data:
${JSON.stringify(payload, null, 2)}`;
}

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "CV rewrite is not configured yet.", code: "missing_api_key" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "We could not read the CV rewrite request. Please try again." },
      { status: 400 }
    );
  }

  const originalCvText = compactText(body?.originalCvText, 18000);
  if (!originalCvText) {
    return Response.json(
      { error: "Readable CV text is required before generating a rewritten draft." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt({
        originalCvText,
        targetRole: body?.targetRole,
        country: body?.country,
        experienceLevel: body?.experienceLevel,
        jobDescription: body?.jobDescription,
        reportData: body?.reportData,
        aiFeedback: body?.aiFeedback,
      }),
      config: {
        responseMimeType: "application/json",
        temperature: 0.35,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    try {
      const parsed = JSON.parse(extractJsonText(responseText));
      return Response.json(normalizeRewrite(parsed));
    } catch (parseError) {
      console.error("Gemini CV rewrite JSON parse failed:", parseError);
      return Response.json(makeFallbackRewrite(responseText));
    }
  } catch (error) {
    console.error("Gemini CV rewrite failed:", error);
    return Response.json(
      { error: "CV rewrite could not be generated right now. Please try again later." },
      { status: 500 }
    );
  }
}
