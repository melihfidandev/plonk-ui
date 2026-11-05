"use client";

import { useId, type ReactNode } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  type DialogTriggerProps,
  type ModalOverlayProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { Countdown } from "./Countdown";
import { DialogFrame, type RenderSlot } from "./DialogFrame";

export { DialogTrigger, type DialogTriggerProps };

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "defaultOpen" | "onOpenChange" | "isKeyboardDismissDisabled"
> {
  title?: ReactNode;
  /** Description under the title; linked to screen readers as the dialog's description. */
  description?: ReactNode;
  /** Content. Pass a function to close the dialog with `close`. */
  children?: RenderSlot;
  /** Actions at the bottom (usually buttons). Can also be a function. */
  footer?: RenderSlot;
  size?: DialogSize;
  /**
   * `alertdialog`: warnings where the user has to make a decision. It doesn't close on
   * an outside click and has no close box.
   */
  role?: "dialog" | "alertdialog";
  /** Close on an outside click? Default: yes for `dialog`. */
  isDismissable?: boolean;
  /** Hides the close box. Hidden by default in `alertdialog`. */
  hideClose?: boolean;
  /** Screen reader name of the close box. */
  closeLabel?: string;
  /**
   * Countdown in seconds (e.g. "Your session is about to expire. Continue?"). When it
   * ends `onCountdownEnd` is called; without it the dialog closes. Give users enough
   * time (WCAG: at least 20 s) and add a button that extends it.
   */
  countdown?: number;
  onCountdownEnd?: (api: { close: () => void }) => void;
  /** Text next to the number. Default: "Continue?". */
  countdownLabel?: ReactNode;
  /** Text read to screen readers with 10 and 5 seconds left (for localization). */
  countdownMessage?: (seconds: number) => string;
  /** Required when there is no visible title. */
  "aria-label"?: string;
  className?: string;
}

const defaultCountdownMessage = (seconds: number) => `${seconds} seconds left`;

const SIZES: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
};

/**
 * A window that opens above the page. Focus stays inside, Esc closes it and focus
 * returns to the button that opened it (React Aria).
 *
 * In Sticker it flies in and settles with a wobble. In Retro it opens with frames
 * growing from the center, like an old Mac. In Comic a speech bubble inflates from
 * its tail; in Arcade it grows in steps like a screen.
 */
export function Dialog({
  title,
  description,
  children,
  footer,
  size = "md",
  role = "dialog",
  isDismissable = role === "dialog",
  hideClose = role === "alertdialog",
  closeLabel = "Close",
  countdown,
  onCountdownEnd,
  countdownLabel = "Continue?",
  countdownMessage = defaultCountdownMessage,
  "aria-label": ariaLabel,
  className,
  ...overlayProps
}: DialogProps) {
  const descriptionId = useId();

  return (
    <ModalOverlay
      {...overlayProps}
      isDismissable={isDismissable}
      className="plonk-dialog-overlay fixed top-0 left-0 z-50 flex h-(--visual-viewport-height) w-full items-center justify-center p-4 sm:p-6"
    >
      <Modal className={cn("plonk-dialog relative w-full", SIZES[size])}>
        <span aria-hidden="true" className="plonk-zoom">
          <span />
          <span />
          <span />
        </span>
        <AriaDialog
          role={role}
          aria-label={ariaLabel}
          aria-describedby={description != null ? descriptionId : undefined}
          className={cn(
            // Köşe kişilikten ezilebilir: Çizgi Roman'da dialog bir konuşma balonu.
            "plonk-card flex max-h-[calc(var(--visual-viewport-height)-2rem)] flex-col rounded-[var(--plonk-dialog-radius,var(--plonk-radius-lg))] bg-plonk-surface text-plonk-ink plonk-shadow-lg outline-none plonk-border",
            className,
          )}
        >
          {({ close }) => (
            <DialogFrame
              close={close}
              title={title}
              description={description}
              descriptionId={descriptionId}
              footer={footer}
              hideClose={hideClose}
              closeLabel={closeLabel}
              countdown={
                countdown != null && (
                  <Countdown
                    key={countdown}
                    seconds={countdown}
                    label={countdownLabel}
                    message={countdownMessage}
                    onEnd={() =>
                      onCountdownEnd ? onCountdownEnd({ close }) : close()
                    }
                  />
                )
              }
            >
              {children}
            </DialogFrame>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
