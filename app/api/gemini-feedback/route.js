import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MODEL = "gemini-3.5-flash";

function compactText(value, maxLength = 900) {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function safeArray(value, maxItems = 8) {
  return Array.isArray(value) ? value.slice(0, maxItems) : [];
}

function stripCodeFence(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function makeFallbackFeedback(responseText) {
  const cleanedText = stripCodeFence(responseText);

  return normalizeFeedback({
    aiSummary:
      "Gemini returned feedback, but it was not formatted as clean JSON. The raw advice is shown below.",
    rewrittenSummarySuggestion:
      "Review the recruiter advice below and adapt the strongest relevant points into your CV summary.",
    topThreeFixes: [
      "Use the raw feedback below to identify the most important CV improvements.",
      "Prioritize missing keywords, clearer evidence, and measurable achievements.",
      "Keep changes accurate to your real experience.",
    ],
    improvedBulletExamples: [
      "Rewrite one experience bullet to include an action, tool, and measurable result.",
      "Add a role-relevant keyword naturally where it reflects your actual work.",
    ],
    recruiterAdvice: cleanedText || "Gemini returned feedback, but it could not be displayed clearly.",
  });
}

function normalizeFeedback(rawFeedback) {
  return {
    aiSummary: compactText(rawFeedback?.aiSummary, 700),
    rewrittenSummarySuggestion: compactText(rawFeedback?.rewrittenSummarySuggestion, 700),
    topThreeFixes: safeArray(rawFeedback?.topThreeFixes, 3).map((item) => compactText(item, 220)),
    improvedBulletExamples: safeArray(rawFeedback?.improvedBulletExamples, 4).map((item) => compactText(item, 240)),
    recruiterAdvice: compactText(rawFeedback?.recruiterAdvice, 700),
  };
}

function buildPrompt(report) {
  const payload = {
    targetRole: compactText(report?.targetRole, 160),
    country: compactText(report?.country, 80),
    experienceLevel: compactText(report?.experienceLevel, 80),
    summary: compactText(report?.summary, 700),
    topProblems: safeArray(report?.topProblems, 5),
    suggestedImprovements: safeArray(report?.suggestedImprovements, 5),
    missingKeywords: safeArray(report?.missingKeywords, 12),
    matchedJobKeywords: safeArray(report?.matchedJobKeywords, 12),
    missingJobKeywords: safeArray(report?.missingJobKeywords, 12),
    jobDescriptionMatchScore: report?.jobDescriptionMatchScore ?? null,
    jobDescription: compactText(report?.jobDescription, 1200),
    sectionFeedback: safeArray(report?.sectionFeedback, 8).map((item) => ({
      section: compactText(item?.section, 80),
      status: compactText(item?.status, 40),
      feedback: compactText(item?.feedback, 260),
    })),
    extractedTextPreview: compactText(report?.extractedTextPreview, 1200),
  };

  return `You are a professional CV reviewer. Based only on this rule-based CV report data, return practical CV improvement feedback.

Return valid JSON only with these exact keys:
{
  "aiSummary": "short professional overview",
  "rewrittenSummarySuggestion": "a stronger CV summary/profile suggestion",
  "topThreeFixes": ["fix 1", "fix 2", "fix 3"],
  "improvedBulletExamples": ["bullet example 1", "bullet example 2", "bullet example 3"],
  "recruiterAdvice": "short recruiter-style advice"
}

Keep advice honest, specific, and suitable for students/junior candidates where relevant. Do not claim facts that are not in the data. Do not mention being an AI.

Report data:
${JSON.stringify(payload, null, 2)}`;
}

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "AI feedback is not configured yet.", code: "missing_api_key" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "We could not read the report data. Please try again." },
      { status: 400 }
    );
  }

  const report = body?.report;
  if (!report || typeof report !== "object") {
    return Response.json(
      { error: "Report data is required to generate feedback." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(report),
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedResponseText = stripCodeFence(responseText);
    try {
      const parsed = JSON.parse(cleanedResponseText);
      return Response.json(normalizeFeedback(parsed));
    } catch (parseError) {
      console.error("Gemini feedback JSON parse failed:", parseError);
      return Response.json(makeFallbackFeedback(responseText));
    }
  } catch (error) {
    console.error("Gemini feedback failed:", error);
    return Response.json(
      { error: "AI feedback could not be generated right now. Please try again later." },
      { status: 500 }
    );
  }
}
