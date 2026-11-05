"use client";

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M10 4.25a.75.75 0 01.75.75v4.25H15a.75.75 0 010 1.5h-4.25V15a.75.75 0 01-1.5 0v-4.25H5a.75.75 0 010-1.5h4.25V5a.75.75 0 01.75-.75z" />
    </svg>
  );
}

interface CartQuantityStepperProps {
  quantity: number;
  title: string;
  onDecrease: () => void;
  onIncrease: () => void;
  /** "outline" matches the product-card button, "solid" matches the product-page Add to Cart button. */
  tone?: "outline" | "solid";
  className?: string;
}

/**
 * The "− 2 +" control that replaces an Add to Cart button once the item is in
 * the cart. It reads and changes the real cart, so it always matches the side
 * cart. Pressing − at 1 removes the item and the Add to Cart button returns.
 */
export function CartQuantityStepper({
  quantity,
  title,
  onDecrease,
  onIncrease,
  tone = "outline",
  className = "",
}: CartQuantityStepperProps) {
  const toneClasses =
    tone === "solid"
      ? "min-h-[56px] bg-action-onlight-bg text-action-onlight-text"
      : "min-h-[38px] sm:min-h-[40px] border border-black bg-white text-black";
  const buttonClasses =
    "flex h-full min-h-[inherit] w-12 flex-none items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] " +
    (tone === "solid" ? "hover:bg-black/10" : "hover:bg-black hover:text-white");

  return (
    <div
      role="group"
      aria-label={`${title} quantity in cart`}
      className={`flex w-full items-stretch justify-between overflow-hidden rounded-[var(--radius-xs)] ${toneClasses} ${className}`}
    >
      <button
        type="button"
        onClick={onDecrease}
        aria-label={quantity <= 1 ? `Remove ${title} from cart` : `Decrease quantity of ${title}`}
        className={buttonClasses}
      >
        <MinusIcon className="h-3.5 w-3.5" />
      </button>
      <span
        aria-live="polite"
        className="flex flex-1 items-center justify-center text-sm font-semibold select-none"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label={`Increase quantity of ${title}`}
        className={buttonClasses}
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
