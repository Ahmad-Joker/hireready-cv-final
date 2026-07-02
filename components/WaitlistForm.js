"use client";

import { useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm({ source = "unknown" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!emailPattern.test(cleanEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          source,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data?.code === "duplicate_email" ? "duplicate" : "error");
        setMessage(data?.message || "We could not join the waitlist right now.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "You are on the Pro Report waitlist.");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("We could not join the waitlist right now. Please try again later.");
    }
  }

  const messageClass =
    status === "success" || status === "duplicate"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block">
          <span className="text-sm font-bold text-ink">Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-action focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-action focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#0F172A] bg-[#0F172A] px-5 py-3 text-center text-sm font-bold text-white shadow-md shadow-slate-900/10 transition hover:border-slate-800 hover:bg-slate-800 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
      >
        {status === "loading" ? "Joining waitlist..." : "Join the Pro Report Waitlist"}
      </button>
      <p className="text-xs font-semibold leading-5 text-slate-500">
        Your email is saved securely for launch updates only.
      </p>
      {message ? (
        <p className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${messageClass}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
