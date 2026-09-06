"use client";

import { useState } from "react";
import { ShareIcon, CheckIcon } from "./icons";

interface ShareButtonProps {
  title: string;
  /** Falls back to window.location.href if not provided */
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");

  async function handleShare() {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const shareData: ShareData = {
      title,
      text: `Check out ${title} on Tvaloka Wellness`,
      url: shareUrl,
    };

    // Use the native Web Share API when available (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setState("shared");
        setTimeout(() => setState("idle"), 2000);
      } catch {
        // User cancelled or share failed — silently ignore
      }
      return;
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // Last resort: prompt
      window.prompt("Copy this link to share:", shareUrl);
    }
  }

  const label =
    state === "copied"
      ? "Link copied!"
      : state === "shared"
      ? "Shared!"
      : "Share";

  return (
    <button
      type="button"
      id="pdp-share-button"
      aria-label={label}
      onClick={handleShare}
      className={[
        "group flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "text-[11px] font-semibold uppercase tracking-wider",
        "transition-all duration-200",
        state !== "idle"
          ? "border-black bg-black text-white"
          : "border-[#dddddd] bg-white text-[#555555] hover:border-black hover:text-black",
      ].join(" ")}
    >
      {state === "copied" || state === "shared" ? (
        <CheckIcon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <ShareIcon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5" />
      )}
      <span>{label}</span>
    </button>
  );
}
