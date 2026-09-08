import React from "react";
import Image from "next/image";

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function IngredientThumbnail({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "md" | "lg";
}) {
  const hasImage = Boolean(src && typeof src === "string" && src.trim() !== "");
  const initial = name ? name.trim().charAt(0).toUpperCase() : "T";

  if (hasImage) {
    return (
      <Image
        src={src!.trim()}
        alt={name}
        fill
        sizes={size === "lg" ? "120px" : "100px"}
        className="object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fafafa] text-[#666666]">
      <LeafIcon className={size === "lg" ? "h-6 w-6 text-[#888888]" : "h-5 w-5 text-[#888888]"} />
      <span className="font-display mt-0.5 text-[10px] sm:text-[11px] font-semibold tracking-wider text-black">
        {initial}
      </span>
    </div>
  );
}
