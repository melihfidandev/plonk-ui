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
 * İpucu tetikleyicisi. React Aria'nın 1.5 saniyelik varsayılanı yerine
 * 500ms bekler; bir ipucu açıkken diğerine geçişte beklemez.
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
 * Kısa açıklama balonu. Sadece metin içindir; etkileşimli içerik için
 * Popover kullan. Sticker'da eğik küçük bir etiket gibi zıplayarak gelir.
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
