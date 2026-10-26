import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export type ProgressVariant =
  "primary" | "secondary" | "accent" | "success" | "warning" | "danger";

export interface ProgressProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** Şu anki değer. `null` ya da verilmezse belirsiz (süre bilinmiyor). */
  value?: number | null;
  max?: number;
  label?: ReactNode;
  /** Yüzdeyi etiketin karşısında gösterir. */
  showValue?: boolean;
  /** Yüzde metnini özelleştirir (ekran okuyucu da bunu okur). */
  formatValue?: (value: number, max: number) => string;
  variant?: ProgressVariant;
}

const FILL: Record<ProgressVariant, string> = {
  primary: "bg-plonk-primary",
  secondary: "bg-plonk-secondary",
  accent: "bg-plonk-accent",
  success: "bg-plonk-success",
  warning: "bg-plonk-warning",
  danger: "bg-plonk-danger",
};

const percent = (value: number, max: number) =>
  `${Math.round((value / max) * 100)}%`;

/**
 * İlerleme çubuğu. Dolgu yayla ilerler; Retro'da bloklar halinde kademeli
 * dolar.
 */
export function Progress({
  value = null,
  max = 100,
  label,
  showValue = false,
  formatValue = percent,
  variant = "primary",
  className,
  ...props
}: ProgressProps) {
  const labelId = useId();
  const indeterminate = value == null;
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const text = indeterminate ? undefined : formatValue(clamped, max);

  return (
    <div className={cn("grid gap-1.5", className)}>
      {(label != null || (showValue && text)) && (
        <div className="flex items-baseline justify-between gap-3 text-sm font-bold">
          {label != null && <span id={labelId}>{label}</span>}
          {showValue && text && (
            <span className="font-plonk-mono text-plonk-ink-muted tabular-nums">
              {text}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label != null ? labelId : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={text}
        {...props}
        data-indeterminate={indeterminate || undefined}
        className="plonk-progress-track relative h-4 overflow-hidden rounded-plonk-pill bg-plonk-sunken plonk-border"
      >
        <div
          className={cn(
            "plonk-progress-fill absolute inset-y-0",
            FILL[variant],
          )}
          style={
            indeterminate
              ? undefined
              : { translate: `${(clamped / max) * 100 - 100}% 0` }
          }
        />
      </div>
    </div>
  );
}
