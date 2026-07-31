export const reportData = {
  scores: [
    { label: "Overall CV Score", score: 76, accent: "#2563EB" },
    { label: "ATS Score", score: 82, accent: "#10B981" },
    { label: "Keyword Match", score: 64, accent: "#2563EB" },
    { label: "Structure Score", score: 79, accent: "#10B981" },
    { label: "Impact Score", score: 72, accent: "#2563EB" },
    { label: "Readability Score", score: 81, accent: "#10B981" },
  ],
  hasJobDescription: false,
  jobDescriptionMatchScore: null,
  matchedJobKeywords: [],
  missingJobKeywords: [],
  summary:
    "Your CV has a clear structure, but it needs stronger role-specific keywords, measurable achievements, and a more targeted summary.",
  topStrengths: [
    "The CV uses a clear structure that recruiters can scan quickly.",
    "Core education and experience information is easy to find.",
    "The document has enough detail for a basic ATS and keyword review.",
  ],
  topProblems: [
    "The CV does not include enough measurable achievements.",
    "The skills section is too generic.",
    "The summary is not targeted enough to the selected role.",
  ],
  missingKeywords: [
    "Content strategy",
    "Meta Ads",
    "Campaign analysis",
    "SEO basics",
    "Google Analytics",
    "Copywriting",
  ],
  suggestedImprovements: [
    "Add numbers to your experience, such as growth %, reach, engagement, or campaign results.",
    "Use role-specific keywords from the job description.",
    "Make the professional summary shorter and more direct.",
    "Separate technical skills from soft skills.",
  ],
  atsFormattingNotes: [
    "Use standard headings like Skills, Experience, Projects, and Education.",
    "Keep contact details as selectable text so ATS tools can read them.",
    "Use concise bullet points for responsibilities, achievements, and projects.",
    "Avoid placing important CV text only inside images, icons, or complex graphics.",
  ],
  sectionFeedback: [
    {
      section: "Contact",
      status: "Good",
      feedback: "Contact details should be visible near the top and written as plain text.",
    },
    {
      section: "Summary/Profile",
      status: "Needs work",
      feedback: "Rewrite the summary so it names the target role and strongest proof in two or three lines.",
    },
    {
      section: "Experience",
      status: "Needs work",
      feedback: "Turn responsibilities into achievement-focused bullets with numbers, tools, or outcomes.",
    },
    {
      section: "Skills",
      status: "Needs work",
      feedback: "Replace broad skills with specific tools, platforms, and role keywords.",
    },
    {
      section: "Education",
      status: "Good",
      feedback: "Education is present and should stay concise unless coursework is highly relevant.",
    },
    {
      section: "Projects",
      status: "Needs work",
      feedback: "Add one or two role-relevant projects if work experience is limited.",
    },
  ],
  actionPlan: {
    fixFirst: [
      "Add measurable achievements to the strongest experience or project bullets.",
      "Rewrite the summary for the target role.",
    ],
    improveNext: [
      "Add missing keywords naturally in skills and experience.",
      "Group technical skills separately from soft skills.",
    ],
    niceToHave: [
      "Add a portfolio, LinkedIn, or project link if relevant.",
      "Keep a master CV and tailor a shorter version for each role.",
    ],
  },
};
