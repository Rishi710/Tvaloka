"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

const pClass = "text-sm leading-relaxed text-tertiary";

/**
 * Single-open accordion for one group of Q&As. Each group instance manages
 * its own state, and starts fully collapsed — unlike ProductAccordion (which
 * opens its first section by default), five auto-opened groups on one page
 * would read as cluttered rather than scannable.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-[var(--space-3)]">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-[var(--space-4)] py-[var(--space-3)] text-left transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-primary">{item.question}</span>
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                className={`shrink-0 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isOpen && <p className={`${pClass} pb-[var(--space-3)]`}>{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
