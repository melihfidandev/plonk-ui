import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";

/** Etiketli form öğelerinin ortak özellikleri. */
export interface FieldProps {
  /** Görünen etiket. Yoksa `aria-label` ya da `aria-labelledby` ver. */
  label?: ReactNode;
  /** Etiketin altındaki yardımcı metin. */
  description?: ReactNode;
  /**
   * Hata mesajı. Verildiğinde öğe geçersiz sayılır (`aria-invalid`).
   * Mesajsız işaretlemek için `true`.
   */
  error?: ReactNode;
}

const hasContent = (node: ReactNode) =>
  node != null && typeof node !== "boolean" && node !== "";

/** Etiket, açıklama ve hata için kimlikleri üretir ve birbirine bağlar. */
export function useField({
  id,
  description,
  error,
  describedBy,
}: {
  id?: string;
  description?: ReactNode;
  error?: ReactNode;
  describedBy?: string;
}) {
  const auto = useId();
  const descriptionId = hasContent(description)
    ? `${auto}-description`
    : undefined;
  const errorId = hasContent(error) ? `${auto}-error` : undefined;
  return {
    id: id ?? `${auto}-control`,
    descriptionId,
    errorId,
    invalid: error != null && error !== false && error !== "",
    describedBy:
      [describedBy, descriptionId, errorId].filter(Boolean).join(" ") ||
      undefined,
  };
}

export function FieldLabel({
  htmlFor,
  required,
  className,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-bold text-plonk-ink", className)}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-plonk-ink-muted">
          *
        </span>
      )}
    </label>
  );
}

export function FieldDescription({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  if (!id) return null;
  return (
    <p id={id} className={cn("text-sm text-plonk-ink-muted", className)}>
      {children}
    </p>
  );
}

/** Hata mesajı: eğik yapıştırılmış küçük bir etiket olarak belirir. */
export function FieldError({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  if (!id) return null;
  return (
    <p
      id={id}
      className={cn(
        "plonk-field-error inline-flex w-fit items-center gap-1.5 rounded-plonk-sm bg-plonk-danger px-2 py-0.5 text-sm font-bold text-plonk-on-danger plonk-border",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-3.5 shrink-0"
        fill="currentColor"
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.9 3h1.8l-.3 5H7.4l-.3-5ZM8 12.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
      {children}
    </p>
  );
}
