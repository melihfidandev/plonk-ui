"use client";

import type { ComponentPropsWithRef, MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { playJelly } from "../../motion/jelly";

export type ButtonVariant =
  "primary" | "secondary" | "accent" | "danger" | "neutral" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Metnin önündeki ikon. Ekran okuyuculardan gizlenir. */
  iconStart?: ReactNode;
  /** Metnin arkasındaki ikon. Ekran okuyuculardan gizlenir. */
  iconEnd?: ReactNode;
  /** İş sürerken: tıklanamaz, genişliği korunur, yerine yükleniyor noktaları gelir. */
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "plonk-pressable plonk-border bg-plonk-primary text-plonk-on-primary",
  secondary:
    "plonk-pressable plonk-border bg-plonk-secondary text-plonk-on-secondary",
  accent: "plonk-pressable plonk-border bg-plonk-accent text-plonk-on-accent",
  danger: "plonk-pressable plonk-border bg-plonk-danger text-plonk-on-danger",
  neutral: "plonk-pressable plonk-border bg-plonk-surface text-plonk-ink",
  ghost:
    "border-(length:--plonk-border-width) border-transparent bg-transparent text-plonk-ink transition-colors plonk-motion-spring hover:bg-plonk-ink/8 active:bg-plonk-ink/14 disabled:bg-transparent",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-plonk-sm px-3 text-sm",
  md: "h-10 gap-2 rounded-plonk-md px-4 text-base",
  lg: "h-12 gap-2.5 rounded-plonk-md px-6 text-lg",
};

/**
 * Basınca gölgesinin yerine iner, bırakınca yayla çıkıp jöle gibi esner.
 * Hareketin dili kişilikten gelir: Retro'da anlık ve kademeli.
 */
export function Button({
  variant = "primary",
  size = "md",
  iconStart,
  iconEnd,
  loading = false,
  type = "button",
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
    playJelly(e.currentTarget);
  };

  return (
    <button
      {...props}
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || props["aria-disabled"] || undefined}
      onClick={handleClick}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center font-plonk-display leading-none whitespace-nowrap select-none",
        "outline-offset-3 focus-visible:outline-3 focus-visible:outline-plonk-focus",
        "disabled:cursor-not-allowed disabled:border-dashed! disabled:bg-plonk-sunken disabled:text-plonk-ink-muted",
        "aria-busy:cursor-progress",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-[inherit]",
          // visibility: hidden adı da gizlerdi; opacity ekran okuyucuya adı bırakır.
          loading && "opacity-0",
        )}
      >
        {iconStart && <Icon>{iconStart}</Icon>}
        {children}
        {iconEnd && <Icon>{iconEnd}</Icon>}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="plonk-dots absolute inset-0 flex items-center justify-center gap-[0.3em]"
        >
          <span />
          <span />
          <span />
        </span>
      )}
    </button>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 [&>svg]:size-[1.15em]"
    >
      {children}
    </span>
  );
}
