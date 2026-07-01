const ROLE_KEYWORD_GROUPS = [
  {
    match: ["marketing", "social media"],
    keywords: [
      "Content strategy",
      "Meta Ads",
      "Google Analytics",
      "SEO",
      "Copywriting",
      "Campaign analysis",
      "Engagement",
      "Content calendar",
      "Brand awareness",
      "Social media management",
    ],
  },
  {
    match: ["software", "developer", "frontend", "backend"],
    keywords: [
      "JavaScript",
      "React",
      "HTML",
      "CSS",
      "Node.js",
      "API",
      "Git",
      "SQL",
      "Database",
      "Testing",
    ],
  },
  {
    match: ["data", "ai", "machine learning"],
    keywords: [
      "Python",
      "SQL",
      "Machine Learning",
      "Data Analysis",
      "Pandas",
      "NumPy",
      "Model Evaluation",
      "Visualization",
      "Statistics",
      "Scikit-learn",
    ],
  },
  {
    match: ["business", "marketing"],
    keywords: [
      "Strategy",
      "Market research",
      "Communication",
      "Sales",
      "Customer analysis",
      "Reporting",
      "Presentation",
      "Leadership",
      "Problem solving",
      "Teamwork",
    ],
  },
];

const GENERAL_KEYWORDS = [
  "Communication",
  "Leadership",
  "Problem solving",
  "Teamwork",
  "Projects",
  "Achievements",
  "Analysis",
  "Planning",
];

const ACTION_VERBS = [
  "achieved",
  "built",
  "created",
  "delivered",
  "designed",
  "developed",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "reported",
  "supported",
];

const VAGUE_WORDS = [
  "hardworking",
  "motivated",
  "passionate",
  "responsible",
  "team player",
  "fast learner",
  "detail-oriented",
];

const JOB_DESCRIPTION_STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "with",
  "for",
  "from",
  "this",
  "that",
  "your",
  "you",
  "are",
  "will",
  "can",
  "have",
  "has",
  "our",
  "a",
  "an",
  "as",
  "at",
  "be",
  "by",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "to",
  "we",
  "who",
  "work",
  "working",
  "role",
  "team",
  "company",
  "candidate",
  "responsibilities",
  "requirements",
  "required",
  "preferred",
  "experience",
  "skills",
]);

const JOB_KEYWORD_HINTS = [
  "analytics",
  "analysis",
  "campaign",
  "communication",
  "content",
  "css",
  "customer",
  "data",
  "design",
  "email",
  "excel",
  "facebook",
  "figma",
  "git",
  "google",
  "html",
  "instagram",
  "javascript",
  "linkedin",
  "management",
  "marketing",
  "meta",
  "microsoft",
  "node",
  "performance",
  "platform",
  "project",
  "python",
  "react",
  "reporting",
  "research",
  "sales",
  "seo",
  "social",
  "sql",
  "strategy",
  "testing",
  "writing",
];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function countWords(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function detectSection(normalizedText, terms) {
  return includesAny(normalizedText, terms);
}

function getRoleKeywords(targetRole) {
  const role = targetRole.toLowerCase();
  const group = ROLE_KEYWORD_GROUPS.find((item) =>
    item.match.some((term) => role.includes(term))
  );

  return group?.keywords || GENERAL_KEYWORDS;
}

function normalizeKeyword(keyword) {
  return keyword.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function titleCaseKeyword(keyword) {
  return keyword
    .split(" ")
    .map((word) => {
      if (word.length <= 3 && /[+#.]/.test(word)) return word.toUpperCase();
      if (["seo", "sql", "css", "html", "api"].includes(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function hasKeyword(text, keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) return false;
  return text.includes(normalizedKeyword);
}

function extractJobKeywords(jobDescription) {
  const normalizedDescription = normalizeKeyword(jobDescription);
  const words = normalizedDescription.match(/\b[a-z0-9+#.][a-z0-9+#.-]{2,}\b/g) || [];
  const wordCounts = words.reduce((acc, word) => {
    if (JOB_DESCRIPTION_STOP_WORDS.has(word) || /^\d+$/.test(word)) return acc;
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const phrases = [];
  for (let size = 3; size >= 2; size -= 1) {
    for (let index = 0; index <= words.length - size; index += 1) {
      const phraseWords = words.slice(index, index + size);
      const meaningfulWords = phraseWords.filter((word) => !JOB_DESCRIPTION_STOP_WORDS.has(word));
      if (meaningfulWords.length < 2) continue;
      const phrase = meaningfulWords.join(" ");
      if (phrase.length < 8) continue;
      phrases.push(phrase);
    }
  }

  const phraseCounts = phrases.reduce((acc, phrase) => {
    acc[phrase] = (acc[phrase] || 0) + 1;
    return acc;
  }, {});

  const scoredPhrases = Object.entries(phraseCounts).map(([keyword, count]) => ({
    keyword,
    score:
      count * 3 +
      keyword.split(" ").length +
      (JOB_KEYWORD_HINTS.some((hint) => keyword.includes(hint)) ? 4 : 0),
  }));

  const scoredWords = Object.entries(wordCounts).map(([keyword, count]) => ({
    keyword,
    score:
      count * 2 +
      (keyword.length >= 7 ? 2 : 0) +
      (JOB_KEYWORD_HINTS.some((hint) => keyword.includes(hint)) ? 5 : 0),
  }));

  const selected = [...scoredPhrases, ...scoredWords]
    .sort((a, b) => b.score - a.score || a.keyword.localeCompare(b.keyword))
    .map((item) => item.keyword)
    .filter((keyword, index, allKeywords) => {
      const duplicate = allKeywords.findIndex((other) => other === keyword) !== index;
      const containedInEarlierPhrase = allKeywords
        .slice(0, index)
        .some((other) => other.split(" ").length > keyword.split(" ").length && other.includes(keyword));
      return !duplicate && !containedInEarlierPhrase;
    })
    .slice(0, 16);

  return selected.map(titleCaseKeyword);
}

function scoreLength(wordCount) {
  if (wordCount >= 350 && wordCount <= 850) return 95;
  if (wordCount >= 250 && wordCount < 350) return 78;
  if (wordCount > 850 && wordCount <= 1100) return 76;
  if (wordCount >= 150) return 58;
  return 34;
}

function getSectionStatus(found, important = true) {
  if (found) return "Good";
  return important ? "Missing" : "Needs work";
}

function makeSectionFeedback({
  hasContact,
  hasSummary,
  hasEducation,
  hasExperience,
  hasSkills,
  hasProjects,
  hasCertifications,
}) {
  return [
    {
      section: "Contact",
      status: getSectionStatus(hasContact),
      feedback: hasContact
        ? "Email and phone signals are visible near the CV text."
        : "Add a clear email and phone number near the top of the CV.",
    },
    {
      section: "Summary/Profile",
      status: getSectionStatus(hasSummary, false),
      feedback: hasSummary
        ? "A profile or summary section appears to be present."
        : "Add a short targeted profile that matches the role.",
    },
    {
      section: "Education",
      status: getSectionStatus(hasEducation),
      feedback: hasEducation
        ? "Education details were detected."
        : "Add education, degree, university, dates, or relevant coursework.",
    },
    {
      section: "Experience",
      status: getSectionStatus(hasExperience),
      feedback: hasExperience
        ? "Experience or employment content was detected."
        : "Add experience, internships, or relevant responsibilities.",
    },
    {
      section: "Skills",
      status: getSectionStatus(hasSkills),
      feedback: hasSkills
        ? "A dedicated skills area appears to be present."
        : "Add a clear skills section with role-specific keywords.",
    },
    {
      section: "Projects",
      status: getSectionStatus(hasProjects, false),
      feedback: hasProjects
        ? "Projects are included, which is useful for students and juniors."
        : "Add projects if experience is limited or technical proof is needed.",
    },
    {
      section: "Certifications",
      status: getSectionStatus(hasCertifications, false),
      feedback: hasCertifications
        ? "Certifications or courses were detected."
        : "Add relevant courses or certifications if they support the target role.",
    },
  ];
}

export function generateCvReport({
  text,
  targetRole = "",
  jobDescription = "",
  country = "General",
  experienceLevel = "Junior",
  fileName = "",
}) {
  const rawText = text || "";
  const normalizedText = rawText.toLowerCase();
  const normalizedCvText = normalizeKeyword(rawText);
  const cleanJobDescription = jobDescription.trim();
  const hasJobDescription = cleanJobDescription.length > 0;
  const wordCount = countWords(rawText);
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(rawText);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(rawText);
  const hasLinkedInOrPortfolio = /(linkedin\.com|github\.com|behance\.net|dribbble\.com|portfolio|https?:\/\/|www\.)/i.test(rawText);
  const hasSummary = detectSection(normalizedText, ["summary", "profile", "objective", "about me"]);
  const hasEducation = detectSection(normalizedText, ["education", "university", "degree", "bachelor", "college", "school"]);
  const hasExperience = detectSection(normalizedText, ["experience", "work experience", "employment", "internship"]);
  const hasSkills = detectSection(normalizedText, ["skills", "technical skills", "core skills", "key skills"]);
  const hasProjects = detectSection(normalizedText, ["projects", "portfolio projects", "academic projects"]);
  const hasCertifications = detectSection(normalizedText, ["certification", "certifications", "certificate", "course", "courses"]);
  const hasContact = hasEmail && hasPhone;
  const bulletCount = countMatches(rawText, /(^|\n)\s*([•*-]|\d+[.)])\s+/g);
  const actionVerbCount = ACTION_VERBS.reduce(
    (total, verb) => total + countMatches(normalizedText, new RegExp(`\\b${verb}\\b`, "g")),
    0
  );
  const achievementMatches = rawText.match(/\b\d+(\.\d+)?\s?%|\b\d{2,}\b/g) || [];
  const achievementCount = achievementMatches.length;
  const vagueMatches = VAGUE_WORDS.filter((word) => normalizedText.includes(word));
  const repeatedWords = Object.entries(
    (normalizedText.match(/\b[a-z]{5,}\b/g) || []).reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {})
  ).filter(([, count]) => count >= 9);

  const roleKeywords = getRoleKeywords(targetRole);
  const jobKeywords = hasJobDescription ? extractJobKeywords(cleanJobDescription) : [];
  const matchedJobKeywords = jobKeywords.filter((keyword) => hasKeyword(normalizedCvText, keyword));
  const missingJobKeywords = jobKeywords.filter(
    (keyword) => !matchedJobKeywords.includes(keyword)
  );
  const jobDescriptionMatchScore = hasJobDescription
    ? clamp(jobKeywords.length ? (matchedJobKeywords.length / jobKeywords.length) * 100 : 0)
    : null;
  const matchedKeywords = roleKeywords.filter((keyword) =>
    normalizedText.includes(keyword.toLowerCase())
  );
  const missingKeywords = roleKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  const lengthScore = scoreLength(wordCount);
  const contactScore = clamp(
    (hasEmail ? 35 : 0) + (hasPhone ? 35 : 0) + (hasLinkedInOrPortfolio ? 30 : 0)
  );
  const structureScore = clamp(
    (hasContact ? 14 : 0) +
      (hasSummary ? 10 : 0) +
      (hasEducation ? 14 : 0) +
      (hasExperience ? 18 : 0) +
      (hasSkills ? 18 : 0) +
      (hasProjects ? 14 : 0) +
      (hasCertifications ? 8 : 0) +
      (lengthScore >= 75 ? 4 : 0)
  );
  const roleKeywordScore = clamp((matchedKeywords.length / roleKeywords.length) * 100);
  const keywordScore = hasJobDescription ? jobDescriptionMatchScore : roleKeywordScore;
  const impactScore = clamp(
    (achievementCount >= 5 ? 42 : achievementCount >= 3 ? 32 : achievementCount >= 1 ? 18 : 0) +
      (actionVerbCount >= 8 ? 30 : actionVerbCount >= 4 ? 22 : actionVerbCount >= 1 ? 12 : 0) +
      (bulletCount >= 8 ? 20 : bulletCount >= 4 ? 14 : bulletCount >= 1 ? 8 : 0) +
      (hasProjects ? 8 : 0)
  );
  const readabilityScore = clamp(
    lengthScore -
      (vagueMatches.length * 7) -
      (repeatedWords.length * 4) +
      (bulletCount >= 4 ? 10 : 0) +
      (hasSummary ? 5 : 0)
  );
  const atsScore = clamp(
    contactScore * 0.22 +
      structureScore * 0.34 +
      keywordScore * 0.2 +
      readabilityScore * 0.14 +
      lengthScore * 0.1
  );
  const overallScore = clamp(
    atsScore * 0.28 +
      keywordScore * 0.2 +
      structureScore * 0.2 +
      impactScore * 0.18 +
      readabilityScore * 0.14
  );

  const topStrengths = [];
  if (hasEmail && hasPhone) topStrengths.push("Contact details are easy to identify.");
  if (structureScore >= 75) topStrengths.push("The CV has a clear core structure.");
  if (matchedKeywords.length >= Math.ceil(roleKeywords.length / 2)) {
    topStrengths.push("Several target-role keywords are already present.");
  }
  if (achievementCount >= 3) topStrengths.push("The CV includes measurable results.");
  if (actionVerbCount >= 4) topStrengths.push("Action verbs help the experience read more actively.");
  if (!topStrengths.length) topStrengths.push("The CV has enough readable text to generate a basic review.");

  const topProblems = [];
  const suggestedImprovements = [];
  const atsFormattingNotes = [];

  if (!hasEmail || !hasPhone) {
    topProblems.push("Contact details are incomplete or hard to detect.");
    suggestedImprovements.push("Place a clear email address and phone number at the top of the CV.");
  }
  if (!hasLinkedInOrPortfolio) {
    suggestedImprovements.push("Add a LinkedIn, GitHub, portfolio, or relevant professional link.");
  }
  if (wordCount < 250) {
    topProblems.push("The CV is quite short and may not provide enough evidence.");
    suggestedImprovements.push("Add more detail to relevant experience, projects, coursework, or achievements.");
  } else if (wordCount > 900) {
    topProblems.push("The CV is long and may be difficult to scan quickly.");
    suggestedImprovements.push("Trim repeated content and keep the strongest details for the target role.");
  }
  if (!hasSkills) {
    topProblems.push("A dedicated skills section was not detected.");
    suggestedImprovements.push("Add a skills section with keywords that match the target role.");
  }
  if (!hasExperience && !hasProjects) {
    topProblems.push("Experience or projects are not clearly detected.");
    suggestedImprovements.push("Add experience, internships, or projects with concise bullet points.");
  }
  if (missingKeywords.length) {
    topProblems.push("Important target-role keywords are missing.");
    suggestedImprovements.push("Add missing keywords naturally where they match your real work.");
  }
  if (missingJobKeywords.length) {
    topProblems.push("Some job description keywords are missing from the CV.");
    suggestedImprovements.push("Add the most relevant missing keywords naturally inside your experience or skills section.");
    suggestedImprovements.push("Do not keyword-stuff. Use keywords only where they match your real experience.");
    suggestedImprovements.push("Mirror the language of the job description where accurate.");
  }
  if (achievementCount < 3) {
    topProblems.push("The CV needs more measurable achievements.");
    suggestedImprovements.push("Add numbers, percentages, volume, reach, revenue, savings, or time saved.");
  }
  if (bulletCount < 4) {
    topProblems.push("Few bullet points were detected, which can reduce scanability.");
    suggestedImprovements.push("Use concise bullet points under experience or projects.");
  }
  if (vagueMatches.length) {
    topProblems.push("Some vague words were detected that may not prove impact.");
    suggestedImprovements.push("Replace vague traits with evidence, tools, outcomes, or examples.");
  }

  atsFormattingNotes.push(
    hasEmail && hasPhone
      ? "Contact information is detectable."
      : "Make contact details plain text so ATS tools can read them."
  );
  atsFormattingNotes.push(
    hasSkills && hasExperience && hasEducation
      ? "Core sections use recognizable headings."
      : "Use standard headings like Skills, Experience, Projects, and Education."
  );
  atsFormattingNotes.push(
    bulletCount >= 4
      ? "Bullet-style content should be easy to scan."
      : "Use bullet points for responsibilities and achievements."
  );
  atsFormattingNotes.push(
    "Avoid placing important CV text only inside images, icons, or complex graphics."
  );

  const sectionFeedback = makeSectionFeedback({
    hasContact,
    hasSummary,
    hasEducation,
    hasExperience,
    hasSkills,
    hasProjects,
    hasCertifications,
  });

  const actionPlan = {
    fixFirst: [
      !hasContact ? "Add complete contact details." : null,
      achievementCount < 3 ? "Add measurable achievements to experience or project bullets." : null,
      !hasSkills ? "Add a role-focused skills section." : null,
    ].filter(Boolean).slice(0, 2),
    improveNext: [
      missingKeywords.length ? "Add more role-specific keywords from the target job description." : null,
      bulletCount < 4 ? "Rewrite dense paragraphs into concise bullet points." : null,
      !hasSummary ? "Add a short targeted summary/profile." : null,
    ].filter(Boolean).slice(0, 2),
    niceToHave: [
      !hasLinkedInOrPortfolio ? "Add LinkedIn, GitHub, or a portfolio link." : null,
      !hasCertifications ? "Add relevant certifications or short courses if available." : null,
      hasProjects ? null : "Add one or two strong projects to support your experience.",
    ].filter(Boolean).slice(0, 2),
  };

  if (!actionPlan.fixFirst.length) actionPlan.fixFirst.push("Tailor the first half of the CV to the target role.");
  if (!actionPlan.improveNext.length) actionPlan.improveNext.push("Tighten wording and keep every bullet outcome-focused.");
  if (!actionPlan.niceToHave.length) actionPlan.niceToHave.push("Keep a separate master CV and tailor each application.");

  const finalProblems = Array.from(new Set(topProblems)).slice(0, 4);
  const finalImprovements = Array.from(new Set(suggestedImprovements)).slice(0, 5);

  return {
    generated: true,
    fileName,
    targetRole,
    country,
    experienceLevel,
    extractedTextPreview: rawText.slice(0, 650),
    checks: {
      wordCount,
      hasEmail,
      hasPhone,
      hasLinkedInOrPortfolio,
      hasSummary,
      hasSkills,
      hasExperience,
      hasProjects,
      hasEducation,
      hasCertifications,
      bulletCount,
      actionVerbCount,
      achievementCount,
      vagueWords: vagueMatches,
      repeatedWords: repeatedWords.map(([word]) => word).slice(0, 5),
      matchedKeywords,
      jobKeywords,
      matchedJobKeywords,
      missingJobKeywords,
    },
    jobDescription: cleanJobDescription,
    hasJobDescription,
    matchedJobKeywords,
    missingJobKeywords,
    jobDescriptionMatchScore,
    scores: [
      { label: "Overall CV Score", score: overallScore, accent: "#2563EB" },
      { label: "ATS Score", score: atsScore, accent: "#10B981" },
      { label: "Keyword Match", score: keywordScore, accent: "#2563EB" },
      { label: "Structure Score", score: structureScore, accent: "#10B981" },
      { label: "Impact Score", score: impactScore, accent: "#2563EB" },
      { label: "Readability Score", score: readabilityScore, accent: "#10B981" },
    ],
    summary:
      overallScore >= 80
        ? `Your CV is well positioned for ${targetRole || "the selected role"}, with strong structure and useful recruiter signals for ${country} applications.`
        : `Your CV has usable foundations for ${targetRole || "the selected role"}, but the biggest gains will come from clearer evidence, stronger keywords, and more ATS-friendly structure.`,
    scoreExplanation: [
      `ATS Score checks contact details, section headings, role keywords, readability, and length.`,
      `Impact Score looks for bullet points, action verbs, and measurable results such as numbers or percentages.`,
      hasJobDescription
        ? `Keyword Match compares your CV text against important keywords from the job description you provided.`
        : `Keyword Match compares your CV text against the selected role keyword group.`,
    ],
    topStrengths: topStrengths.slice(0, 4),
    topProblems: finalProblems.length
      ? finalProblems
      : ["No major rule-based issues were detected in this basic review."],
    missingKeywords: missingKeywords.length ? missingKeywords : ["No major keyword gaps detected"],
    suggestedImprovements: finalImprovements.length
      ? finalImprovements
      : ["Keep tailoring the CV to each job description before applying."],
    atsFormattingNotes,
    sectionFeedback,
    actionPlan,
  };
}
