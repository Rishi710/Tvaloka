"use client";

import { useId, useState } from "react";

type Status = "idle" | "loading" | "success" | "already";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SubscribeForm() {
  const baseId = useId();
  const inputId = `${baseId}-email`;
  const messageId = `${baseId}-message`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const value = email.trim();
    if (!value) {
      setError("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address (e.g. name@example.com).");
      return;
    }

    setError(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data: { ok: boolean; alreadyRegistered?: boolean; error?: string } = await res.json();
      if (data.ok) {
        setStatus(data.alreadyRegistered ? "already" : "success");
        setEmail("");
        return;
      }
      setError(data.error ?? "We couldn't subscribe you just now. Please try again.");
    } catch {
      setError("We couldn't subscribe you just now. Please try again.");
    }
    setStatus("idle");
  }

  if (status === "success" || status === "already") {
    return (
      <div role="status" className="flex items-start gap-[var(--space-3)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action-ondark-bg text-action-ondark-text">
          <CheckIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-md text-ondark">
            {status === "success" ? "You're on the list" : "You're already with us"}
          </p>
          <p className="mt-[var(--space-1)] text-sm text-ondark-secondary">
            {status === "success"
              ? "Thank you for subscribing. Watch your inbox for Tvaloka rituals and launches."
              : "This email is already registered with us."}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className={`mt-[var(--space-2)] text-xs text-ondark-secondary underline underline-offset-4 transition-colors hover:text-ondark ${focusRing}`}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div
        className={`flex items-center gap-[var(--space-1)] rounded-[var(--radius-xs)] bg-action-ondark-bg p-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white ${
          error ? "outline outline-2 outline-offset-2 outline-[#ffb4ab]" : ""
        }`}
      >
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          className="min-w-0 flex-1 bg-transparent px-[var(--space-3)] py-[var(--space-3)] text-sm text-action-ondark-text outline-none placeholder:text-tertiary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="group flex shrink-0 items-center gap-[var(--space-1)] rounded-[3px] bg-action-onlight-bg px-[var(--space-4)] py-[var(--space-3)] text-sm font-semibold text-action-onlight-text transition-colors duration-[var(--motion-instant)] hover:bg-action-onlight-bg-hover active:bg-action-onlight-bg-active disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:px-[var(--space-5)]"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
          {status !== "loading" && (
            <ArrowIcon className="hidden h-4 w-4 transition-transform duration-[var(--motion-instant)] group-hover:translate-x-0.5 sm:block" />
          )}
        </button>
      </div>

      {error ? (
        <p id={messageId} role="alert" className="mt-[var(--space-2)] text-xs font-semibold text-[#ffb4ab]">
          {error}
        </p>
      ) : (
        <p className="mt-[var(--space-2)] text-xs text-ondark-secondary">
          By subscribing you agree to receive marketing emails. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
