"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import { generateCvReport } from "../../lib/cvReport";
import { extractPdfText } from "../../lib/pdfText";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [experienceLevel, setExperienceLevel] = useState("Student");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  function setSelectedFile(selectedFile) {
    setFile(selectedFile || null);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
  }

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please choose a PDF file.");
      return;
    }

    setSelectedFile(selectedFile);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please select a PDF CV before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const text = await extractPdfText(file);

      if (!text) {
        throw new Error("No readable text was found in this PDF.");
      }

      const report = generateCvReport({
        text,
        targetRole,
        jobDescription,
        country,
        experienceLevel,
        fileName,
      });

      window.localStorage.setItem("hireready_generated_report", JSON.stringify(report));
      window.localStorage.setItem("targetRole", targetRole);
      window.localStorage.setItem("jobDescription", jobDescription);
      window.localStorage.setItem("country", country);
      window.localStorage.setItem("experienceLevel", experienceLevel);
      router.push("/report");
    } catch (analysisError) {
      setError(
        analysisError?.message ||
          "We could not extract text from this PDF. Try a text-based PDF rather than a scanned image."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <section className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-ink">Analyze your CV</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Upload your CV and choose your target role to generate a sample report.
            </p>
            <p className="mx-auto mt-4 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              Your CV is not uploaded to a server in this MVP. Text is extracted locally in your browser.
            </p>
          </div>

          <form
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="block">
              <span className="sr-only">Upload CV</span>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center transition hover:border-action hover:bg-blue-50"
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
              >
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-action" fill="none" aria-hidden="true">
                  <path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="mt-4 text-base font-bold text-ink">
                  Drag and drop your PDF here, or click to browse
                </span>
                <span className="mt-2 text-sm text-slate-500">PDF only. Works best with text-based CVs.</span>
                {fileName ? (
                  <span className="mt-4 max-w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-action shadow-sm">
                    Selected PDF: <span className="break-all">{fileName}</span>
                  </span>
                ) : null}
              </div>
              <input
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            <div className="mt-6">
              <label htmlFor="target-role" className="text-sm font-bold text-ink">
                Target role
              </label>
              <input
                id="target-role"
                type="text"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="e.g. Junior Social Media Marketer"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-action focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="job-description" className="text-sm font-bold text-ink">
                Job description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job description here to get a more accurate keyword match."
                rows={6}
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-action focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-2 text-sm font-medium text-slate-500">
                Optional, but recommended for better keyword matching.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className="text-sm font-bold text-ink">
                  Country
                </label>
                <select
                  id="country"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none transition focus:border-action focus:ring-4 focus:ring-blue-100"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                >
                  <option>Egypt</option>
                  <option>UK</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience-level" className="text-sm font-bold text-ink">
                  Experience level
                </label>
                <select
                  id="experience-level"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none transition focus:border-action focus:ring-4 focus:ring-blue-100"
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value)}
                >
                  <option>Student</option>
                  <option>Junior</option>
                  <option>Mid-level</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-5 mt-8 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing CV..." : "Analyze CV"}
              </Button>
              <p className="mt-4 text-sm font-medium text-slate-500">
                Your CV text is extracted in your browser. No account required.
              </p>
              {error ? (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
