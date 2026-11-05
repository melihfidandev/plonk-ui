"use client";

import { useId, type ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { DialogFrame, type RenderSlot } from "../dialog/DialogFrame";

export type DrawerPlacement = "right" | "left" | "bottom";

export interface DrawerProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "defaultOpen" | "onOpenChange" | "isKeyboardDismissDisabled"
> {
  title?: ReactNode;
  description?: ReactNode;
  children?: RenderSlot;
  footer?: RenderSlot;
  /** Which edge it comes from. Default: right. */
  placement?: DrawerPlacement;
  /** Close on an outside click? Default: yes. */
  isDismissable?: boolean;
  hideClose?: boolean;
  closeLabel?: string;
  "aria-label"?: string;
  className?: string;
}

const PLACEMENT: Record<DrawerPlacement, string> = {
  right: "justify-end",
  left: "justify-start",
  bottom: "items-end",
};

// Görünen genişlik + ekran dışındaki gizli pay (--plonk-drawer-overhang).
const PANEL: Record<DrawerPlacement, string> = {
  right:
    "h-full w-[calc(min(26rem,100vw-2.5rem)+var(--plonk-drawer-overhang))]",
  left: "h-full w-[calc(min(26rem,100vw-2.5rem)+var(--plonk-drawer-overhang))]",
  bottom: "max-h-[85%] w-full",
};

/**
 * A panel that slides in from an edge. Same accessibility behavior as Dialog; use
 * `DialogTrigger` as its trigger.
 *
 * In Sticker it springs in and overshoots a little: the panel is drawn with a hidden
 * margin that extends off screen, so no gap shows at the edge during the overshoot.
 */
export function Drawer({
  title,
  description,
  children,
  footer,
  placement = "right",
  isDismissable = true,
  hideClose = false,
  closeLabel = "Close",
  "aria-label": ariaLabel,
  className,
  ...overlayProps
}: DrawerProps) {
  const descriptionId = useId();

  return (
    <ModalOverlay
      {...overlayProps}
      isDismissable={isDismissable}
      className={cn(
        "plonk-dialog-overlay fixed top-0 left-0 z-50 flex h-(--visual-viewport-height) w-full overflow-hidden",
        PLACEMENT[placement],
      )}
    >
      <Modal
        data-placement={placement}
        className={cn("plonk-drawer flex", PANEL[placement])}
      >
        <AriaDialog
          aria-label={ariaLabel}
          aria-describedby={description != null ? descriptionId : undefined}
          className={cn(
            "plonk-card plonk-drawer-panel flex min-h-0 flex-1 flex-col bg-plonk-surface text-plonk-ink outline-none plonk-border",
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
            >
              {children}
            </DialogFrame>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
