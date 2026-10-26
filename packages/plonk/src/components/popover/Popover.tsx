"use client";

import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Heading,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";

export interface PopoverProps extends Pick<
  AriaPopoverProps,
  | "placement"
  | "offset"
  | "crossOffset"
  | "isOpen"
  | "defaultOpen"
  | "onOpenChange"
  | "triggerRef"
  | "shouldFlip"
> {
  /** Küçük başlık; dialog'un adı olarak da kullanılır. */
  title?: ReactNode;
  /** İçerik. Fonksiyon verilirse `close` ile kapatabilirsin. */
  children?: ReactNode | ((api: { close: () => void }) => ReactNode);
  /** Görünür başlık yoksa zorunlu. */
  "aria-label"?: string;
  className?: string;
}

/**
 * Tetikleyicinin yanında açılan küçük panel. `DialogTrigger` ile kullanılır.
 * Tetikleyiciye tıklanan noktadan büyüyerek çıkar.
 */
export function Popover({
  title,
  children,
  "aria-label": ariaLabel,
  className,
  offset = 12,
  ...props
}: PopoverProps) {
  return (
    <AriaPopover
      {...props}
      offset={offset}
      className={cn(
        "plonk-popover max-w-[min(22rem,calc(100vw-1.5rem))] rounded-plonk-md bg-plonk-surface text-plonk-ink plonk-shadow plonk-border",
        className,
      )}
    >
      <AriaDialog aria-label={ariaLabel} className="p-4 outline-none">
        {({ close }) => (
          <>
            {title != null && (
              <Heading
                slot="title"
                className="mb-2 font-plonk-display text-lg leading-tight"
              >
                {title}
              </Heading>
            )}
            {typeof children === "function" ? children({ close }) : children}
          </>
        )}
      </AriaDialog>
    </AriaPopover>
  );
}
