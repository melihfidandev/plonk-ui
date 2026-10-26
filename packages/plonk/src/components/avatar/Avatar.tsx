"use client";

import {
  Children,
  createContext,
  use,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { cn } from "../../lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

const SizeContext = createContext<AvatarSize | null>(null);

const SIZES: Record<AvatarSize, string> = {
  // --plonk-avatar-overlap: grupta bir öncekinin üstüne ne kadar bineceği.
  sm: "size-8 text-xs [--plonk-avatar-overlap:0.4rem]",
  md: "size-10 text-sm [--plonk-avatar-overlap:0.55rem]",
  lg: "size-14 text-lg [--plonk-avatar-overlap:0.8rem]",
};

// Baş harflerin zemini: aynı isim her zaman aynı rengi alır.
const FALLBACK_COLORS = [
  "bg-plonk-primary text-plonk-on-primary",
  "bg-plonk-accent text-plonk-on-accent",
  "bg-plonk-secondary text-plonk-on-secondary",
  "bg-plonk-success text-plonk-on-success",
  "bg-plonk-warning text-plonk-on-warning",
];

function hash(text: string) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.codePointAt(0)!) | 0;
  return Math.abs(h);
}

/** "Melih Fidan" → "MF", "plonk" → "P" */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1 ? [words[0], words.at(-1)] : [words[0] ?? ""];
  return letters
    .map((w) => [...(w ?? "")][0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

export interface AvatarProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** Kişinin adı: resmin alternatif metni ve yedek baş harfler buradan gelir. */
  name: string;
  src?: string;
  size?: AvatarSize;
}

/** Profil resmi. Resim yoksa ya da yüklenemezse renkli baş harfler. */
export function Avatar({ name, src, size, className, ...props }: AvatarProps) {
  const groupSize = use(SizeContext);
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = src != null && src !== failedSrc;

  return (
    <span
      {...props}
      className={cn(
        "plonk-avatar relative inline-grid shrink-0 place-items-center overflow-hidden rounded-plonk-pill font-plonk-display leading-none select-none plonk-border",
        SIZES[size ?? groupSize ?? "md"],
        !showImage && FALLBACK_COLORS[hash(name) % FALLBACK_COLORS.length],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailedSrc(src)}
          // Sunucuda render edilen resim, React bağlanmadan hata vermiş olabilir.
          ref={(img) => {
            if (img?.complete && img.naturalWidth === 0) setFailedSrc(src);
          }}
          className="size-full object-cover"
        />
      ) : (
        <span role="img" aria-label={name}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}

export interface AvatarGroupProps extends ComponentPropsWithRef<"div"> {
  /** En fazla bu kadar avatar gösterilir; kalanı "+N" olur. */
  max?: number;
  size?: AvatarSize;
  /** "+N" kutusunun ekran okuyucu metni. */
  moreLabel?: (count: number) => string;
}

/** Üst üste binen avatarlar. Üzerine gelince her biri yayla kalkar. */
export function AvatarGroup({
  max,
  size = "md",
  moreLabel = (count) => `${count} more`,
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = max != null ? items.slice(0, max) : items;
  const rest = items.length - visible.length;

  return (
    <SizeContext value={size}>
      <div
        role="group"
        {...props}
        className={cn("plonk-avatar-group flex items-center", className)}
      >
        {visible}
        {rest > 0 && (
          <span
            role="img"
            aria-label={moreLabel(rest)}
            className={cn(
              "plonk-avatar inline-grid shrink-0 place-items-center rounded-plonk-pill bg-plonk-surface font-plonk-display leading-none plonk-border",
              SIZES[size],
            )}
          >
            +{rest}
          </span>
        )}
      </div>
    </SizeContext>
  );
}
