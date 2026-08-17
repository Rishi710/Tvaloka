import Image from "next/image";

type MediaFrameProps = {
  /** Drop a real image in and it renders instead of the placeholder. */
  src?: string;
  /** Required whenever `src` is set — describes the image for screen readers. */
  alt?: string;
  /** Shown inside the placeholder so each empty slot says what belongs there. */
  label: string;
  className?: string;
  aspectClassName?: string;
  priority?: boolean;
  /**
   * Stretch to fill the nearest positioned ancestor instead of holding its own
   * aspect ratio. Use for banners where overlaid copy sets the height — a fixed
   * ratio would otherwise clip that copy at narrow widths.
   */
  fill?: boolean;
  sizes?: string;
};

export function MediaFrame({
  src,
  alt,
  label,
  className = "",
  aspectClassName = "aspect-[4/3]",
  priority = false,
  fill = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: MediaFrameProps) {
  const box = fill ? "absolute inset-0" : `relative ${aspectClassName}`;

  return (
    <div
      className={`${box} overflow-hidden rounded-[var(--radius-xs)] bg-[radial-gradient(circle_at_30%_25%,_#262626,_#000000_65%)] ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      ) : (
        // Corner-anchored so it never collides with text overlaid on the frame.
        <p className="absolute right-[var(--space-3)] bottom-[var(--space-3)] text-right text-[10px] font-semibold tracking-[0.3em] text-ondark-secondary uppercase">
          {label}
        </p>
      )}
    </div>
  );
}
