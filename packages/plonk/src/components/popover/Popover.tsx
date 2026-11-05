"use client";

import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Heading,
  OverlayArrow,
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
  /** Small heading; also used as the dialog's name. */
  title?: ReactNode;
  /** Content. Pass a function to close it with `close`. */
  children?: ReactNode | ((api: { close: () => void }) => ReactNode);
  /** Required when there is no visible title. */
  "aria-label"?: string;
  className?: string;
}

/**
 * A small panel that opens next to its trigger. Used with `DialogTrigger`.
 * It grows out from where the trigger was clicked. In Comic it's a speech bubble whose
 * tail points at the trigger.
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
        "plonk-popover plonk-popover-panel max-w-[min(22rem,calc(100vw-1.5rem))] rounded-[var(--plonk-popover-radius,var(--plonk-radius-md))] bg-plonk-surface text-plonk-ink plonk-shadow plonk-border",
        className,
      )}
    >
      {/* Kuyruk: yerini React Aria hesaplar, kişilik CSS'i gösterip gizler. */}
      <OverlayArrow className="plonk-popover-arrow">
        <svg aria-hidden="true" width={18} height={13} viewBox="0 0 18 13">
          <path d="M0 0 9 12 18 0" />
        </svg>
      </OverlayArrow>
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
