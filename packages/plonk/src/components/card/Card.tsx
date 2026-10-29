import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CloseIcon } from "./CloseIcon";

export interface CardProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  title?: ReactNode;
  description?: ReactNode;
  /** Başlığın sağındaki eylemler (buton, menü…). */
  actions?: ReactNode;
  footer?: ReactNode;
  /**
   * Kapatma kutusu. Retro'da başlık çubuğunun solunda, Sticker'da sağ üstte
   * durur. Verilmezse gösterilmez.
   */
  onClose?: () => void;
  /** Kapatma kutusunun ekran okuyucu adı. */
  closeLabel?: string;
  /** Sticker'da üstte yarı saydam bir bant. Retro'da görünmez. */
  tape?: boolean;
  /** Kişiliğin eğim açısıyla yapıştırır. Retro'da eğim 0'dır. */
  tilt?: "left" | "right";
  /** Başlık etiketinin seviyesi (sayfadaki başlık sırasına uysun diye). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/**
 * İçerik kutusu. Retro'da her kart bir pencere: başlık, çizgili bir
 * başlık çubuğuna yerleşir.
 */
export function Card({
  title,
  description,
  actions,
  footer,
  onClose,
  closeLabel = "Close",
  tape = false,
  tilt,
  headingLevel = 3,
  className,
  children,
  ...props
}: CardProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  const hasHeader = title != null || actions != null || onClose != null;

  return (
    <section
      aria-labelledby={title != null ? titleId : undefined}
      {...props}
      data-tape={tape || undefined}
      className={cn(
        "plonk-card relative flex flex-col rounded-plonk-lg bg-plonk-surface text-plonk-ink plonk-shadow plonk-border",
        tilt === "left" && "plonk-tilt",
        tilt === "right" && "plonk-tilt-reverse",
        className,
      )}
    >
      {hasHeader && (
        <header className="plonk-card-header flex items-start gap-3">
          {onClose && (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="plonk-card-close grid shrink-0 cursor-pointer place-items-center outline-offset-2 focus-visible:outline-3 focus-visible:outline-plonk-focus"
            >
              <CloseIcon />
            </button>
          )}
          {title != null && (
            <div className="plonk-card-heading min-w-0 flex-1">
              <Heading
                id={titleId}
                className="plonk-card-title font-plonk-display text-xl leading-tight"
              >
                {title}
              </Heading>
            </div>
          )}
          {actions != null && (
            <div className="plonk-card-actions flex shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}
      {description != null && (
        <p className="plonk-card-description px-5 text-sm text-plonk-ink-muted">
          {description}
        </p>
      )}
      {children != null && (
        <div className="plonk-card-body flex-1 px-5 py-4">{children}</div>
      )}
      {footer != null && (
        <footer className="plonk-card-footer flex flex-wrap items-center gap-3 px-5 py-4">
          {footer}
        </footer>
      )}
    </section>
  );
}
