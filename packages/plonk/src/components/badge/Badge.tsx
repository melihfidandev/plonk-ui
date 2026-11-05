import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  variant?: BadgeVariant;
  /** A small status dot at the start. */
  dot?: boolean;
}

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-plonk-surface text-plonk-ink",
  primary: "bg-plonk-primary text-plonk-on-primary",
  secondary: "bg-plonk-secondary text-plonk-on-secondary",
  accent: "bg-plonk-accent text-plonk-on-accent",
  success: "bg-plonk-success text-plonk-on-success",
  warning: "bg-plonk-warning text-plonk-on-warning",
  danger: "bg-plonk-danger text-plonk-on-danger",
};

/** A status or category label. */
export function Badge({
  variant = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "plonk-badge inline-flex w-fit items-center gap-1.5 rounded-plonk-pill px-2.5 py-0.5 text-xs leading-5 font-extrabold whitespace-nowrap plonk-border",
        VARIANTS[variant],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-plonk-pill bg-current"
        />
      )}
      {children}
    </span>
  );
}
