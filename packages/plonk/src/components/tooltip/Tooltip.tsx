"use client";

import type { ReactNode } from "react";
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";

export type TooltipTriggerProps = TooltipTriggerComponentProps;

/**
 * Tooltip trigger. Waits 500ms instead of React Aria's 1.5 second default; no
 * delay when moving from one open tooltip to another.
 */
export function TooltipTrigger({
  delay = 500,
  closeDelay = 200,
  ...props
}: TooltipTriggerProps) {
  return (
    <AriaTooltipTrigger delay={delay} closeDelay={closeDelay} {...props} />
  );
}

export interface TooltipProps extends Pick<
  AriaTooltipProps,
  "placement" | "offset" | "crossOffset" | "shouldFlip"
> {
  children?: ReactNode;
  className?: string;
}

/**
 * A short explanation bubble. Text only; use Popover for interactive content.
 * In Sticker it hops in like a small tilted label.
 */
export function Tooltip({ className, offset = 10, ...props }: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      className={cn(
        "plonk-tooltip max-w-64 rounded-plonk-sm bg-plonk-ink px-2.5 py-1.5 text-sm font-bold text-plonk-surface",
        className,
      )}
    />
  );
}
