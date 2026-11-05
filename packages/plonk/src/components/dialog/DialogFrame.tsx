import type { ReactNode } from "react";
import { Heading } from "react-aria-components";
import { CloseIcon } from "../card/CloseIcon";

export type RenderSlot =
  ReactNode | ((api: { close: () => void }) => ReactNode);

const render = (slot: RenderSlot, close: () => void) =>
  typeof slot === "function" ? slot({ close }) : slot;

/**
 * Shared inner layout of Dialog and Drawer: title (and close box), description,
 * scrolling content, actions at the bottom. Uses the `.plonk-card-*` classes; in Retro
 * the title sits in the window's title bar.
 */
export function DialogFrame({
  close,
  title,
  description,
  descriptionId,
  footer,
  hideClose,
  closeLabel,
  countdown,
  children,
}: {
  close: () => void;
  title?: ReactNode;
  description?: ReactNode;
  descriptionId: string;
  footer?: RenderSlot;
  hideClose: boolean;
  closeLabel: string;
  /** Below the description, before the content (the dialog's countdown). */
  countdown?: ReactNode;
  children?: RenderSlot;
}) {
  const hasHeader = title != null || !hideClose;
  return (
    <>
      {hasHeader && (
        <header className="plonk-card-header flex items-start gap-3">
          {!hideClose && (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={close}
              className="plonk-card-close grid shrink-0 cursor-pointer place-items-center outline-offset-2 focus-visible:outline-3 focus-visible:outline-plonk-focus"
            >
              <CloseIcon />
            </button>
          )}
          <div className="plonk-card-heading min-w-0 flex-1">
            {title != null && (
              <Heading
                slot="title"
                className="plonk-card-title font-plonk-display text-2xl leading-tight"
              >
                {title}
              </Heading>
            )}
          </div>
        </header>
      )}
      {description != null && (
        <p
          id={descriptionId}
          className="plonk-card-description px-5 text-plonk-ink-muted"
        >
          {description}
        </p>
      )}
      {countdown}
      {children != null && (
        <div className="plonk-card-body min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {render(children, close)}
        </div>
      )}
      {footer != null && (
        <footer className="plonk-card-footer flex flex-wrap items-center justify-end gap-3 px-5 py-4">
          {render(footer, close)}
        </footer>
      )}
    </>
  );
}
