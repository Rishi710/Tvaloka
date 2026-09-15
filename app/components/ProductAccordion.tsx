"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShopifyMetafield } from "../lib/shopify/types";
import type { Ingredient } from "../ingredients/IngredientsView";
import { parseBotanicalName } from "../lib/productIngredients";

interface ProductAccordionProps {
  metafields?: ShopifyMetafield[];
  ingredients?: Ingredient[];
}

interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface RichTextNode {
  type?: string;
  value?: string;
  level?: number;
  listType?: "ordered" | "unordered";
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  children?: RichTextNode[];
}

/**
 * Parses Shopify Rich Text AST JSON or fallback string into clean React elements.
 */
function renderRichText(value: string) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.type === "root" && Array.isArray(parsed.children)) {
      return (
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-[#444444]">
          {parsed.children.map((node: RichTextNode, idx: number) => renderNode(node, idx))}
        </div>
      );
    }
  } catch {
    // If not JSON, render as plain/formatted text
  }

  // Plain text fallback (handle newlines and bullet characters)
  return (
    <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-[#444444] space-y-2">
      {value.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case "paragraph":
      return (
        <p key={index} className="leading-relaxed">
          {node.children?.map((child: RichTextNode, cIdx: number) => renderChild(child, cIdx))}
        </p>
      );

    case "heading": {
      const level = Math.min(Math.max(node.level || 4, 3), 6);
      const Tag = `h${level}` as "h3" | "h4" | "h5" | "h6";
      return (
        <Tag
          key={index}
          className="font-sans font-semibold text-black mt-3 mb-1 text-xs sm:text-sm tracking-wide uppercase"
        >
          {node.children?.map((child: RichTextNode, cIdx: number) => renderChild(child, cIdx))}
        </Tag>
      );
    }

    case "list": {
      const isOrdered = node.listType === "ordered";
      const ListTag = isOrdered ? "ol" : "ul";
      return (
        <ListTag
          key={index}
          className={`my-2 space-y-1 pl-5 ${
            isOrdered ? "list-decimal" : "list-disc"
          } text-xs sm:text-sm text-[#444444]`}
        >
          {node.children?.map((item: RichTextNode, iIdx: number) => (
            <li key={iIdx} className="leading-relaxed">
              {item.children?.map((c: RichTextNode, cIdx: number) => renderChild(c, cIdx))}
            </li>
          ))}
        </ListTag>
      );
    }

    case "list-item":
      return (
        <li key={index} className="leading-relaxed">
          {node.children?.map((child: RichTextNode, cIdx: number) => renderChild(child, cIdx))}
        </li>
      );

    default:
      return renderChild(node, index);
  }
}

function renderChild(child: RichTextNode, index: number): React.ReactNode {
  if (!child) return null;

  if (typeof child === "string") {
    return child;
  }

  if (child.type === "text") {
    let content: React.ReactNode = child.value;

    // Handle newline splits inside text value
    if (typeof child.value === "string" && child.value.includes("\n")) {
      content = child.value.split("\n").map((part: string, i: number) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </React.Fragment>
      ));
    }

    if (child.bold) {
      content = <strong className="font-semibold text-black">{content}</strong>;
    }
    if (child.italic) {
      content = <em className="italic">{content}</em>;
    }
    if (child.underline) {
      content = <span className="underline">{content}</span>;
    }

    return <React.Fragment key={index}>{content}</React.Fragment>;
  }

  if (child.type === "link") {
    return (
      <a
        key={index}
        href={child.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-black underline underline-offset-4 hover:text-[#666666]"
      >
        {child.children?.map((c: RichTextNode, cIdx: number) => renderChild(c, cIdx))}
      </a>
    );
  }

  return null;
}

/**
 * Specialized renderer for FAQs with bullet points, answers, and scrollable container.
 */
function renderFAQRichText(value: string) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.type === "root" && Array.isArray(parsed.children)) {
      return (
        <div className="max-h-[320px] overflow-y-auto pr-3 space-y-4">
          {parsed.children.map((node: RichTextNode, idx: number) => {
            if (node.type === "heading") {
              return (
                <div key={idx} className="flex items-start gap-2.5 pt-2 first:pt-0">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#bfaea0]"
                  />
                  <h4 className="font-sans font-semibold text-black text-xs sm:text-sm leading-snug">
                    {node.children?.map((child: RichTextNode, cIdx: number) => renderChild(child, cIdx))}
                  </h4>
                </div>
              );
            }

            if (node.type === "paragraph") {
              return (
                <p key={idx} className="pl-4.5 text-xs sm:text-sm leading-relaxed text-[#555555]">
                  {node.children?.map((child: RichTextNode, cIdx: number) => renderChild(child, cIdx))}
                </p>
              );
            }

            return renderNode(node, idx);
          })}
        </div>
      );
    }
  } catch {
    // Plain text fallback
  }

  return (
    <div className="max-h-[320px] overflow-y-auto pr-3 space-y-3 text-xs sm:text-sm leading-relaxed text-[#444444]">
      {value.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

export function ProductAccordion({
  metafields = [],
  ingredients = [],
}: ProductAccordionProps) {
  // Map metafields to structured sections
  const metafieldMap = new Map<string, ShopifyMetafield>();
  metafields.forEach((m) => {
    if (m && m.key && m.value) {
      metafieldMap.set(m.key, m);
    }
  });

  const sections: AccordionSection[] = [];

  // 1. Benefits
  const benefits = metafieldMap.get("benefits");
  if (benefits && benefits.value) {
    sections.push({
      id: "benefits",
      title: "Benefits",
      content: renderRichText(benefits.value),
    });
  }

  // 2. How To Use
  const howToUse = metafieldMap.get("how_to_use");
  if (howToUse && howToUse.value) {
    sections.push({
      id: "how_to_use",
      title: "How To Use",
      content: renderRichText(howToUse.value),
    });
  }

  // 3. Ingredients
  if (ingredients && ingredients.length > 0) {
    sections.push({
      id: "ingredients",
      title: "Ingredients",
      content: (
        <div className="space-y-3.5 pt-1 text-xs sm:text-sm">
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => {
              const { common, latin } = parseBotanicalName(ing.word);
              return (
                <span
                  key={ing.word}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-xs text-black"
                >
                  <span className="font-semibold">{common}</span>
                  {latin && (
                    <span className="font-serif italic text-[11px] text-[#777777]">
                      ({latin})
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <div className="pt-1">
            <Link
              href="/ingredients"
              className="text-xs text-black font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Explore more Ingredients
            </Link>
          </div>
        </div>
      ),
    });
  }

  // 3. FAQs (Scrollable with custom bullet points)
  const faqs = metafieldMap.get("faqs");
  if (faqs && faqs.value) {
    sections.push({
      id: "faqs",
      title: "FAQs",
      content: renderFAQRichText(faqs.value),
    });
  }

  // 4. Safety Information
  const safetyInfo = metafieldMap.get("safety_information");
  if (safetyInfo && safetyInfo.value) {
    sections.push({
      id: "safety_information",
      title: "Safety Information",
      content: renderRichText(safetyInfo.value),
    });
  }

  // 5. Additional Information
  const additionalInfo = metafieldMap.get("additional_information");
  if (additionalInfo && additionalInfo.value) {
    sections.push({
      id: "additional_information",
      title: "Additional Information",
      content: renderRichText(additionalInfo.value),
    });
  }

  // Accordion open/close state: Open the first section by default
  const [openSectionId, setOpenSectionId] = useState<string | null>(sections[0]?.id || null);

  const toggleSection = (id: string) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  // If no metafields present for this product, return null
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-[#e5e5e5]">
      {sections.map((section) => {
        const isOpen = openSectionId === section.id;
        return (
          <div key={section.id} className="border-b border-[#e5e5e5]">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between py-4.5 text-left transition-colors hover:text-[#555555] focus-visible:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider text-black">
                {section.title}
              </span>
              <span className="ml-4 flex h-6 w-6 items-center justify-center text-black">
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
              </span>
            </button>

            {isOpen && (
              <div className="pb-5 pt-1 text-xs sm:text-sm animate-fadeIn">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
