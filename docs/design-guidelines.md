# Luxury Ayurveda Beauty Store — UI Guidelines

Implementation-ready, token-driven UI guidance for a WCAG 2.2 AA, keyboard-first e-commerce storefront.

---

## 1. Context and Goals

**Design intent (one sentence):** Deliver a monochrome, minimal, high-craft storefront where every link, button, input, list, and nav element resolves to the same finite set of semantic tokens, so 2,000+ live component instances stay visually and behaviorally consistent without per-page exceptions.

- **Brand:** Luxury Ayurveda Beauty Store · [forestessentialsindia.com](https://www.forestessentialsindia.com/) (reference)
- **Audience:** Online shoppers, general consumer, mixed device mix (assume majority mobile traffic for e-commerce).
- **Surface:** E-commerce storefront (browse, PDP, cart, account, search).
- **Visual style:** Clean, functional, implementation-oriented — grayscale-first, high contrast, generous whitespace, no decorative chrome that isn't a token.
- **Standard:** WCAG 2.2 AA, keyboard-first, focus-visible mandatory, contrast enforced.

This document is authoritative for implementation. Where the supplied token set is incomplete or fails accessibility math, that is called out explicitly in §2.4 rather than silently patched — those items require design sign-off before build, not engineering judgment calls.

---

## 2. Design Tokens and Foundations

Tokens are grouped by source:
- **[PROVIDED]** — supplied verbatim in the brief. Non-negotiable; teams **must** use these values as-is.
- **[DERIVED]** — not supplied, but required to satisfy the Do/Don't rules (states, accessibility, semantics). Flagged for design sign-off; engineering **should** implement as specified until superseded.

### 2.1 Typography

| Token | Value | Source |
|---|---|---|
| `font.family.primary` | Open Sans | PROVIDED |
| `font.family.stack` | `"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | PROVIDED value + system fallback chain (should) |
| `font.size.base` | 14px | PROVIDED |
| `font.weight.base` | 400 | PROVIDED |
| `font.lineHeight.base` | 20px (1.43 ratio) | PROVIDED |
| `font.weight.medium` | 600 | DERIVED — required for hierarchy without a second family |
| `font.weight.bold` | 700 | DERIVED — headings, price emphasis |

**Type scale** (all PROVIDED sizes; line-heights DERIVED at ~1.2–1.45 ratio, pending design sign-off):

| Token | Size | Line-height | Typical role |
|---|---|---|---|
| `font.size.xs` | 12px | 16px | Captions, legal, meta, badges |
| `font.size.sm` | 14px | 20px | Body copy, UI controls (= base) |
| `font.size.md` | 18px | 26px | Subheadings, product titles |
| `font.size.lg` | 30px | 38px | Section headings (H2) |
| `font.size.xl` | 40px | 48px | Page/hero heading (H1) |

**Rules**
- Body copy **must** use `font.size.sm` / `font.weight.base` / `font.lineHeight.base`. No inline font-size overrides.
- Headings **must** step through the scale in order (H1→xl, H2→lg, H3→md); **do not** skip levels for visual effect — skip levels break screen-reader document outline navigation.
- Any text below `font.size.xs` (12px) is prohibited — it fails minimum legibility and most contrast/zoom testing workflows.

### 2.2 Color — Token Accessibility Audit (read before using)

| Token | Value | Source |
|---|---|---|
| `color.surface.base` | `#000000` | PROVIDED |
| `color.surface.muted` | `#FFFFFF` | PROVIDED |
| `color.border.muted` | `#333333` | PROVIDED |
| `color.text.tertiary` | `#666666` | PROVIDED |
| `color.text.inverse` | `#484848` | PROVIDED |

**⚠ Critical finding — `color.text.inverse` is not usable on `color.surface.base` despite the name.** Computed WCAG contrast ratios:

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| `text.inverse` (#484848) on `surface.base` (#000000) | **2.30:1** | 4.5:1 (body) / 3:1 (large) | **FAIL — both thresholds** |
| `text.tertiary` (#666666) on `surface.base` (#000000) | **3.66:1** | 4.5:1 (body) | **FAIL for body text.** Passes only at large-text sizes (≥18.66px/700 or ≥24px/400), i.e. `font.size.md`+ bold or `font.size.lg`+ |
| `border.muted` (#333333) on `surface.base` (#000000) | **1.66:1** | 3:1 (non-text, SC 1.4.11) | **FAIL — do not use as an input/component border on dark surface** |
| `text.inverse` (#484848) on `surface.muted` (#FFFFFF) | 9.15:1 | 4.5:1 | PASS |
| `text.tertiary` (#666666) on `surface.muted` (#FFFFFF) | 5.75:1 | 4.5:1 | PASS |
| `border.muted` (#333333) on `surface.muted` (#FFFFFF) | 12.63:1 | 3:1 | PASS |

**Binding rule:** `color.text.inverse`, `color.text.tertiary`, and `color.border.muted` **must** only be used on `color.surface.muted` (light) contexts as supplied. They **must not** be used on `color.surface.base` (dark/black) contexts. Any dark-surface UI **must** use the derived `onDark` tokens below instead. This is a token-naming defect in the source data (`inverse` implies dark-surface use but the value fails there) — flag to design; do not "fix" by silently changing the provided hex value.

**Derived tokens (pending design sign-off), required for dark-surface parity and component states:**

| Token | Value | Verified contrast | Purpose |
|---|---|---|---|
| `color.text.primary` | `#000000` | 21:1 on `surface.muted` | Body/heading text on light surface |
| `color.text.onDark.primary` | `#FFFFFF` | 21:1 on `surface.base` | Body/heading text on dark surface |
| `color.text.onDark.secondary` | `#A6A6A6` | 8.63:1 on `surface.base` | Secondary text on dark surface (replaces `text.tertiary` there) |
| `color.text.disabled` | `#999999` | exempt (SC 1.4.3 excludes inactive components) | Disabled control label |
| `color.text.link` | `= color.text.primary` (light) / `color.text.onDark.primary` (dark) | 21:1 both | Underline is the non-color indicator; no separate hue |
| `color.border.default` | `#000000` (light) / `#FFFFFF` (dark) | 21:1 both, exceeds 3:1 non-text min | Input/component borders where `border.muted` is unavailable (dark surfaces) |
| `color.action.primary.bg` | `#000000` (light context) / `#FFFFFF` (dark context) | — | Primary button fill |
| `color.action.primary.text` | `#FFFFFF` (light context) / `#000000` (dark context) | 21:1 both | Primary button label |
| `color.action.primary.bg.hover` | `#1A1A1A` / `#F2F2F2` | text contrast 17.4:1 / — | Hover fill |
| `color.action.primary.bg.active` | `#333333` (`= border.muted`, reused) / `#E5E5E5` | text contrast 12.6:1 / — | Pressed fill |
| `color.surface.disabled` | `#E5E5E5` | exempt | Disabled control fill |
| `color.surface.raised` | `#F5F5F5` (light) / `#141414` (dark) | decorative, delineate with border not contrast | Cards on top of base/muted surfaces |
| `color.surface.overlay` | `rgba(0,0,0,0.6)` | — | Modal/drawer scrim |
| `color.feedback.error.text` | `#B3261E` (light) / `#FF6B60` (dark) | 6.53:1 / 7.53:1 | Error text, icons, borders |
| `color.focus.ring` | `#2563EB` | 5.17:1 on white, 4.06:1 on black (both clear SC 1.4.11's 3:1) | Focus-visible indicator, all components |

**Rules**
- **Must** reference semantic tokens only (`color.action.primary.bg`), never raw hex, in component specs or code.
- **Must not** convey link, error, current-nav, or required-field state through color alone — pair with underline, icon, or text (SC 1.4.1).
- **Should** route any new hue (brand accent, promotional color) through this token table before use; none exists today beyond grayscale + the one error red.

### 2.3 Spacing

| Token | Value | Intended role |
|---|---|---|
| `space.1` | 8px | Icon-to-label gap, tightest inline spacing |
| `space.2` | 10px | Compact control padding (chips, small buttons) |
| `space.3` | 15px | List item internal rhythm |
| `space.4` | 16px | Default component padding (buttons, cards) |
| `space.5` | 20px | Section-internal padding, related-component gaps |
| `space.6` | 30px | Component-group spacing, grid gutters |
| `space.7` | 96.66px | Major section/page vertical rhythm |
| `space.8` | 96.68px | Major section/page vertical rhythm |

**Rules**
- **Must** use only these eight values for all margin/padding/gap. No arbitrary pixel values in component code.
- ⚠ `space.7` (96.66px) and `space.8` (96.68px) are 0.02px apart — almost certainly a sub-pixel rounding artifact from the source `rem` values, not an intentional two-step scale. **Should** be consolidated to a single `space.7 = 96.66px` (or a cleaner `96px`) at the next tokens revision; until then, treat them as interchangeable and default new work to `space.7`.
- **Do not** introduce a `space.9` or any one-off value to "make something look right." If the scale doesn't fit, that's a design escalation, not an implementation decision.

### 2.4 Radius, Shadow, Motion

| Token | Value | Source |
|---|---|---|
| `radius.xs` | 5px | PROVIDED |
| `motion.duration.instant` | 250ms | PROVIDED |
| `motion.duration.fast` | 300ms | PROVIDED |

**Rules**
- `radius.xs` (5px) is the **only** radius token. It **must** be applied uniformly to buttons, inputs, and cards — no per-component radius variation.
- No shadow token was supplied. Elevation **must** be conveyed via `color.surface.raised` + `color.border.muted`/`color.border.default`, not an invented box-shadow value.
- Transitions **must** use `motion.duration.instant` (250ms) for color/opacity state changes (hover, active) and `motion.duration.fast` (300ms) for layout-affecting changes (disclosure open/close, drawer, accordion).
- Focus-visible indicators **must** appear with no transition delay — instant application, not eased in.
- All motion **must** respect `prefers-reduced-motion: reduce` by disabling non-essential transitions/animations (skeleton shimmer, drawer slide) and substituting an instant state change.

---

## 3. Component-Level Rules

Ordered by live-page density (highest-risk drift first): Links (1,041), Buttons (698), Inputs (217), Lists (61), Navigation (22).

### 3.1 Links — 1,041 instances

**Anatomy:** label text, optional leading/trailing icon, underline decoration.

**Variants:** inline body link, standalone/utility link (nav-adjacent, footer), product link (wraps image + title, larger hit area).

| State | Spec |
|---|---|
| Default | `color.text.link`; inline body links **must** carry a permanent underline (color alone is insufficient per SC 1.4.1); standalone/utility links may be underline-on-interaction only |
| Hover | Toggle underline presence; `cursor: pointer`; `motion.duration.instant` |
| Focus-visible | 2px solid `color.focus.ring`, 2px offset; **must** use `:focus-visible`, not `:focus`, so mouse clicks don't show a ring |
| Active | Underline retained; no color change required |
| Disabled | Rare (e.g. disabled breadcrumb crumb) — `color.text.disabled`, `aria-disabled="true"`, `pointer-events: none` |
| Loading | Only for async-triggering links (e.g. "Add to Wishlist"); inline spinner replaces trailing icon, `aria-busy="true"` |
| Error | Not applicable to plain links |

**Keyboard/pointer/touch:** Tab to focus, Enter to activate. **Must not** use a link for a state-mutating action with no navigation (use a button). Minimum hit target 24×24px CSS px (SC 2.5.8) even where visual text is smaller — pad with `space.1`/`space.2`.

**Overflow/edge cases:** product-link titles clamp at 2 lines (`-webkit-line-clamp: 2`) with full text available via `aria-label`/`title`; never truncate to a single line silently.

**Responsive:** increase tap padding around inline utility links on viewports <768px using `space.2`.

### 3.2 Buttons — 698 instances

**Anatomy:** container, label, optional leading/trailing icon, loading spinner (replaces or accompanies label).

**Variants:** Primary (solid), Secondary (outline), Tertiary/Ghost (text-only), Icon-only (mandatory `aria-label`).

**Sizes** (derived from type scale — pending sign-off): sm = `font.size.xs` + `space.2` padding (32px min-height, toolbar/dense contexts only, 24px hit-area minimum enforced); md = `font.size.sm` + `space.4` padding (44px min-height, default); lg = `font.size.md` + `space.5` padding (52px min-height, primary CTA/hero).

| State | Primary (light surface) | Primary (dark surface) |
|---|---|---|
| Default | bg `action.primary.bg` #000, text `action.primary.text` #FFF, `radius.xs` | bg #FFF, text #000 |
| Hover | bg `#1A1A1A`, `motion.duration.instant` | bg `#F2F2F2` |
| Focus-visible | 2px `color.focus.ring` outline, 2px offset, always visible over solid fill (verified 4.06–5.17:1) | same |
| Active/pressed | bg `#333333` (`border.muted` reused) | bg `#E5E5E5` |
| Disabled | bg `surface.disabled` #E5E5E5, text `text.disabled` #999, `cursor: not-allowed`, `aria-disabled="true"` | mirrored light-on-dark equivalent |
| Loading | label hidden or dimmed, spinner shown, fixed `min-width` (no layout shift), `aria-busy="true"`; **must not** use native `disabled` (removes from accessibility tree mid-action) — use `aria-disabled` + blocked click handler instead so state is announced | same |
| Error | No distinct button-error state; failures surface via adjacent inline message, not a recolored button | same |

Secondary/Ghost variants **must** inherit the same state matrix with `border`/`text` swapped for `bg` per standard outline/ghost conventions, using the same tokens.

**Keyboard/pointer/touch:** Enter/Space activates. **Must** remain in tab order while loading. Minimum touch target: 44×44px for md/lg; sm (32px) permitted only with ≥`space.1` separation from adjacent targets and only in dense toolbar contexts.

**Overflow/edge cases:** label **must not** wrap inside a button; use `white-space: nowrap` and step down to a smaller size or icon-only below a defined breakpoint rather than allowing height jump between sibling buttons in a row. Icon-only buttons **must** ship with a discernible `aria-label` — an icon button with no accessible name is a release blocker, not a nit.

### 3.3 Inputs — 217 instances

**Anatomy:** persistent label (never placeholder-only), field, helper text, error text, optional leading/trailing icon (search, password toggle).

**Variants:** text, email, password (with visibility toggle), search, select, textarea. Checkbox/radio inherit the same state matrix with fill/check-mark substituting for border/bg changes.

| State | Light surface | Dark surface |
|---|---|---|
| Default | 1px border `border.muted` #333 (12.63:1, passes) | 1px border `border.default.onDark` #FFF — **must not** use `border.muted` here (fails at 1.66:1) |
| Hover | border → `color.surface.base` #000 (full emphasis) | border → `#FFF` full emphasis (already max) |
| Focus-visible | border stays; add 2px `color.focus.ring` box-shadow halo (no layout shift, additive not replacing border) | same |
| Active/typing | no distinct state beyond focus | same |
| Disabled | bg `surface.disabled` #E5E5E5, text `text.disabled` #999, native `disabled` attribute (exempt from contrast per SC 1.4.3) | mirrored |
| Loading | trailing inline spinner for async validation (e.g. promo code check); validation result announced via `aria-live="polite"` region | same |
| Error | border `feedback.error.text` #B3261E (light) / #FF6B60 (dark) + leading/trailing error icon (not color alone) + error text below field; `aria-invalid="true"`, field references message via `aria-describedby` | same |

**Keyboard/pointer/touch:** full native text-editing behavior; `<label for>` association **must** be programmatic, not visual-only. Field height **must** meet 44px touch target. Password-toggle icon is its own focusable control with `aria-label` ("Show password"/"Hide password") reflecting current state — **must not** rely on icon glyph swap alone to convey state to assistive tech.

**Overflow/edge cases:** overflowing value scrolls horizontally within the field, never clips silently; textarea supports resize or auto-grow with a capped `max-height` + internal scroll; error-text line wraps **must** reserve layout space (or animate height at `motion.duration.fast`) rather than shifting adjacent content unpredictably. Helper text **must** remain visible at all times — placeholder text is not a substitute for a persistent label or helper text (it disappears on input and fails low-vision/cognitive usability).

**Responsive:** full-width below 640px; grouped fields (first/last name) collapse from inline to stacked at that same breakpoint.

### 3.4 Lists — 61 instances

**Anatomy:** container, item (optional thumbnail/icon, primary text, secondary/meta text, optional trailing action).

**Variants:** simple text list (policy/legal bullets), product grid item, interactive list (cart line items, filter checklist), definition list (ingredient/spec table on PDP).

**States** (interactive items only — e.g. cart line, filter row): default; hover (bg `surface.raised`); focus-visible (ring on the item's focusable child — the row itself is not a focus target unless it is itself the sole interactive element); active; disabled (e.g. out-of-stock item — `surface.disabled` bg + explicit "Out of stock" label, not opacity alone); loading (skeleton rows honoring `prefers-reduced-motion`); error (e.g. "Couldn't load recommendations" inline row with a retry action — **must not** fail silently by rendering an empty list).

**Keyboard/pointer/touch:** rows with a single primary action **should** use a stretched-hit-area pattern (whole row navigates) with secondary actions (e.g. "Remove") positioned outside the stretched area so nested-interactive elements never overlap — **do not** nest a button inside an `<a>` or vice versa. Filterable/reorderable lists follow the ARIA APG listbox pattern with Arrow-key navigation; plain content lists need no special handling beyond normal document flow.

**Overflow/edge cases:** item text clamps per §3.1 rules; long/paginated lists **must** paginate or virtualize past a defined threshold (design to specify count); every list **must** define an explicit empty state with a message and a primary action (e.g. empty cart → "Your cart is empty" + "Browse Products" button) — **never** a blank container.

**Responsive:** grid lists **must** specify column count per breakpoint (e.g. 1 / 2 / 4 columns) using `space.5`/`space.6` gutters.

### 3.5 Navigation — 22 instances

**Anatomy:** primary nav bar (logo, category links, utility icons — search/account/cart), mobile nav (hamburger trigger + off-canvas drawer), breadcrumb, mega-menu panel.

Low instance count, high blast radius — this is global, persistent chrome; a defect here affects every page view.

**States:** default and hover follow §3.1 link rules; focus-visible ring on every interactive nav element individually (not the container); **current page/category must** be marked with `aria-current="page"` plus a non-color indicator (underline or weight change, per SC 1.4.1) — color alone is insufficient; disabled is rare (locked nav item); loading applies to async mega-menu content (skeleton + `aria-busy`) and to search-suggestion dropdowns; error applies to failed search suggestions — show an inline retry/empty message, never a silently blank dropdown.

**Keyboard/pointer/touch:** nav links **must not** be exposed via `menu`/`menuitem` ARIA roles (per ARIA APG guidance for navigation) — use `nav > ul > li > a` with a disclosure `button[aria-expanded]` controlling any submenu. Submenus **must** be operable via click/tap and keyboard — **hover-only reveal is prohibited**, it fails keyboard and touch users outright. Escape closes any open submenu/drawer and returns focus to its trigger. Mobile drawer **must** trap focus while open and restore focus to the hamburger trigger on close. Hamburger trigger **must** meet the 44×44px touch target.

**Overflow/edge cases:** nav items that don't fit at a given width collapse into an overflow ("More") menu — **do not** wrap to a second row or clip a category silently. Category labels **must not** truncate without a full-text fallback (`aria-label`/`title`, not hover-only).

**Responsive:** desktop horizontal nav switches to hamburger + drawer at a defined breakpoint (recommend 1024px); drawer width, dismiss-via-Escape, dismiss-via-overlay-click, and an explicit 44px close button are all required, not optional.

---

## 4. Accessibility Requirements — Testable Acceptance Criteria

| # | Criterion | Test method | Pass condition |
|---|---|---|---|
| A1 | Text contrast | Automated contrast checker (axe/Lighthouse) + the ratios in §2.2 | ≥4.5:1 body text, ≥3:1 large text (≥18.66px/700 or ≥24px/400), everywhere in shipped UI |
| A2 | Non-text contrast | Automated + manual on borders/icons/focus rings | ≥3:1 against adjacent surface (SC 1.4.11) |
| A3 | Focus visibility | Keyboard-only pass, Tab through every interactive element on a page | Every focusable element shows a visible `:focus-visible` ring meeting A2; no element is reachable-but-invisible |
| A4 | Keyboard operability | Keyboard-only pass, no mouse | Every interactive component in §3 is fully operable (activate, dismiss, navigate) without a pointer |
| A5 | No hover-only affordance | Keyboard + touch pass on all menus/tooltips | Nothing that reveals on `:hover` is unreachable by keyboard/touch |
| A6 | Color-independent state | Grayscale render or color-blindness simulator | Link, error, current-page, and required-field states remain distinguishable |
| A7 | Target size | Automated (SC 2.5.8) + manual on mobile viewport | All targets ≥24×24px CSS px; primary actions (buttons, inputs, nav triggers) ≥44×44px |
| A8 | Reduced motion | Toggle OS `prefers-reduced-motion: reduce`, re-test all transitions | Non-essential animation is disabled or replaced with an instant state change |
| A9 | Programmatic labels | Screen reader pass (VoiceOver/NVDA) on icon-only buttons, inputs, nav triggers | Every control announces a discernible name; no "button," "link" with no label |
| A10 | Live-region announcements | Screen reader pass on async states (loading, error, validation) | Loading/error/success states are announced via `aria-live`/`aria-busy`/`aria-invalid`, not visual-only |
| A11 | Heading order | Automated (axe) + manual DOM inspection | Heading levels step in order per §2.1, no skipped levels |
| A12 | Empty states | Manual — force zero-result/zero-item conditions in lists, search, cart | Every list/search surface in §3.4/§3.5 shows an explicit message + next action, never a blank container |

---

## 5. Content and Tone Standards

Voice: concise, confident, implementation-focused. No filler, no exclamation-driven copy, no ambiguity about what an action does.

| Do | Don't | Why |
|---|---|---|
| "Add to Bag" | "Click here" / "Submit" | Action verb + object; screen readers announce link/button text out of context, so it must stand alone |
| "Your cart is empty. Browse Products." | "Nothing to see here!" | States the fact, gives the next action; no tone-over-clarity |
| "Enter a valid email address (e.g. name@example.com)." | "Invalid input" | Error text names the field, the problem, and the fix |
| "Show password" / "Hide password" | "👁" with no label | Icon alone is not a label; pair icon with programmatic name |
| "Couldn't load recommendations. Retry." | (blank section) | Failures are stated and actionable, never silent |

**Rules**
- Every interactive-element label **must** be descriptive out of context (no "click here," "read more," "learn more" without a named subject — e.g. "Learn more about Kumkumadi Oil," not bare "Learn more").
- Error messages **must** name the field and the required fix, not just flag failure.
- Empty/zero-result states **must** pair a plain-language message with one primary next action.

---

## 6. Anti-Patterns and Prohibited Implementations

- **Do not** use `color.text.inverse` or `color.text.tertiary` on `color.surface.base` — confirmed contrast failure (§2.2). Use the `onDark` derived tokens.
- **Do not** use `color.border.muted` as a component border on a dark surface — fails SC 1.4.11 at 1.66:1. Use `color.border.default` (onDark variant).
- **Do not** hardcode hex values in component code or specs — every color **must** resolve to a token in §2.2.
- **Do not** introduce a spacing or font-size value outside §2.1/§2.3's scales, including "just this once" hero sections.
- **Do not** reveal navigation submenus, tooltips, or password-toggle affordances on `:hover` only — must be reachable by keyboard and touch.
- **Do not** use native `disabled` on a button mid-loading-state — it removes the element from the accessibility tree and breaks announcement of the busy state; use `aria-disabled` + a blocked handler instead.
- **Do not** nest interactive elements (button-in-link, link-in-button) to achieve a "whole row is clickable" pattern — use a stretched-hit-area technique with sibling controls instead.
- **Do not** ship an icon-only control without `aria-label`.
- **Do not** rely on color alone for link, error, required, or current-page indication.
- **Do not** render an empty list, empty search result, or failed async fetch as a blank container — every one of these **must** have an explicit state per §4/A12.

**Migration notes**
- `space.7`/`space.8` near-duplicate (§2.3) — flag to design for consolidation; do not treat as two intentional steps in new work.
- `color.text.inverse` naming vs. actual usable context (§2.2) — flag to design; rename or supply a true dark-surface-safe value before the token is used as "inverse" anywhere in new components.
- No accent/brand hue exists in the supplied palette beyond grayscale + one derived error red — if brand introduces a signature color (common in Ayurveda/luxury positioning, e.g. a gold or deep green), it **must** enter this token table with contrast verification against both `surface.base` and `surface.muted` before use, not be added ad hoc in a component PR.

---

## 7. QA Checklist

**Tokens**
- [ ] No raw hex/px values in component code — all resolve to a token in §2
- [ ] `text.inverse` / `text.tertiary` / `border.muted` never used on `surface.base`
- [ ] `radius.xs` is the only radius in use
- [ ] Spacing values limited to `space.1`–`space.8`

**States (per component in §3)**
- [ ] Default, hover, focus-visible, active, disabled, loading, and error are all implemented where applicable
- [ ] Focus-visible ring uses `color.focus.ring`, appears instantly, and is never suppressed
- [ ] Disabled state uses `aria-disabled` (not native `disabled`) wherever the control must stay in the accessibility tree during an async operation

**Accessibility (A1–A12 in §4)**
- [ ] Contrast audit passes on every text/background and border/background pairing actually shipped
- [ ] Full keyboard pass completed with no dead ends, no hover-only affordances
- [ ] Screen reader pass confirms labels, live-region announcements, and heading order
- [ ] `prefers-reduced-motion` respected across all transitions
- [ ] All touch targets meet 24px minimum / 44px for primary actions

**Content**
- [ ] No bare "click here"/"submit"/"learn more" labels
- [ ] Every error message names field + fix
- [ ] Every empty/zero-result state has message + primary action

**Responsive**
- [ ] Nav breakpoint behavior verified (horizontal → hamburger/drawer)
- [ ] List/grid column counts verified at each breakpoint
- [ ] Inputs verified full-width and stacked below 640px

**Sign-off gate**
- [ ] All §2.2/§2.4 DERIVED tokens have explicit design approval before shipping to production (not just engineering default)
