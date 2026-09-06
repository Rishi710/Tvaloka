"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from "./icons";
import { useCart } from "./CartContext";

export interface NavItem {
  label: string;
  href: string;
}

/** Static items pinned at the start of the nav bar (if any). */
const NAV_PREFIX: NavItem[] = [];

/** Static items pinned at the end of the nav bar. */
const NAV_SUFFIX: NavItem[] = [
  { label: "About Us", href: "/about-us" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Blogs", href: "/blogs" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SiteHeaderProps {
  /** Dynamic collection nav items fetched from Shopify (server-side). */
  navItems?: NavItem[];
}

export function SiteHeader({ navItems = [] }: SiteHeaderProps) {
  // Merge: pinned prefix → dynamic Shopify collections → pinned suffix
  const categories: NavItem[] = [...NAV_PREFIX, ...navItems, ...NAV_SUFFIX];
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openCart, totalQuantity } = useCart();

  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const drawerTitleId = useId();

  // Trap focus + lock scroll while the mobile drawer is open; restore
  // focus to the trigger on close (WCAG 2.4.3, 2.1.2).
  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusables = drawer
      ? Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    focusables[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const trigger = menuTriggerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  function closeSearch() {
    setIsSearchOpen(false);
    searchToggleRef.current?.focus();
  }

  return (
    <header className="bg-surface-muted">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-3)]">
        {/* Left utility */}
        <div className="flex flex-1 items-center gap-[var(--space-4)]">
          {isSearchOpen ? (
            <form
              role="search"
              className="flex items-center gap-[var(--space-2)]"
              onSubmit={(event) => event.preventDefault()}
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-primary" />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                id="site-search"
                ref={searchInputRef}
                type="search"
                placeholder="Search products"
                className={`w-40 bg-transparent py-[var(--space-1)] text-sm text-primary placeholder:text-tertiary focus-visible:border-b-2 focus-visible:border-black focus-visible:outline-none sm:w-56`}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeSearch();
                }}
              />
              <button
                type="button"
                ref={searchToggleRef}
                onClick={closeSearch}
                className={`p-[var(--space-1)] text-primary ${focusRing}`}
                aria-label="Close search"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              ref={searchToggleRef}
              onClick={() => setIsSearchOpen(true)}
              className={`flex h-11 w-11 items-center justify-center text-primary ${focusRing}`}
              aria-label="Search products"
              aria-expanded={isSearchOpen}
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          )}
          {/* <Link
            href="/stores"
            className={`hidden text-xs font-semibold tracking-wide text-primary underline-offset-4 hover:underline sm:inline ${focusRing}`}
          >
            Stores
          </Link> */}
        </div>

        {/* Wordmark */}
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center text-center ${focusRing}`}
        >
          <span className="font-display text-sm tracking-wide whitespace-nowrap text-primary sm:text-lg">
            Tvaloka Wellness
          </span>
          {/* <span className="text-[10px] font-semibold tracking-[0.3em] whitespace-nowrap text-tertiary uppercase">
            Pure Ayurvedic Luxury
          </span> */}
        </Link>

        {/* Right utility */}
        <div className="flex flex-1 items-center justify-end gap-[var(--space-4)]">
          <Link
            href="/account"
            className={`hidden text-xs font-semibold tracking-wide text-primary underline-offset-4 hover:underline md:inline ${focusRing}`}
          >
            Account
          </Link>
          <Link
            href="/circle"
            className={`hidden text-xs font-semibold tracking-wide text-primary underline-offset-4 hover:underline md:inline ${focusRing}`}
          >
            Wellness Circle
          </Link>
          <button
            type="button"
            onClick={openCart}
            className={`relative flex h-11 w-11 items-center justify-center text-primary ${focusRing}`}
            aria-label={`Open shopping bag, ${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`}
          >
            <CartIcon className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white"
              >
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </span>
            )}
          </button>
          <button
            type="button"
            ref={menuTriggerRef}
            onClick={() => setIsMenuOpen(true)}
            className={`flex h-11 w-11 items-center justify-center text-primary lg:hidden ${focusRing}`}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Category nav — desktop */}
      <nav aria-label="Product categories" className="hidden lg:block">
        <ul className="mx-auto flex max-w-7xl justify-item-center items-center gap-[var(--space-1)] overflow-x-auto px-[var(--space-4)]">
          {categories.map((category) => {
            const isActive = pathname === category.href;
            return (
              <li key={category.href}>
                <Link
                  href={category.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-block px-[var(--space-4)] py-[var(--space-3)] text-xs font-semibold tracking-wide whitespace-nowrap focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-black ${isActive
                    ? "bg-action-onlight-bg text-action-onlight-text"
                    : "text-primary hover:bg-black/[.04]"
                    }`}
                >
                  {category.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile drawer */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-surface-muted"
          >
            <div className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-3)]">
              <span id={drawerTitleId} className="font-display text-md text-primary">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className={`flex h-11 w-11 items-center justify-center text-primary ${focusRing}`}
                aria-label="Close menu"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Product categories" className="flex-1 overflow-y-auto">
              <ul>
                {categories.map((category) => {
                  const isActive = pathname === category.href;
                  return (
                    <li key={category.href}>
                      <Link
                        href={category.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-[var(--space-4)] py-[var(--space-4)] text-sm font-semibold text-primary ${isActive ? "underline" : ""
                          } focus-visible:-outline-offset-2 ${focusRing}`}
                      >
                        {category.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex flex-col gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-4)]">
              <Link
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-semibold text-primary ${focusRing}`}
              >
                Account
              </Link>
              <Link
                href="/circle"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-semibold text-primary ${focusRing}`}
              >
                Wellness Circle
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
