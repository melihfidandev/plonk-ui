import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";

/** Shared props of labeled form controls. */
export interface FieldProps {
  /** Visible label. Without one, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Helper text under the label. */
  description?: ReactNode;
  /**
   * Error message. When given, the control counts as invalid (`aria-invalid`).
   * Pass `true` to mark it without a message.
   */
  error?: ReactNode;
}

const hasContent = (node: ReactNode) =>
  node != null && typeof node !== "boolean" && node !== "";

/** Generates ids for the label, description and error and links them together. */
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

/** Error message: appears as a small tilted label stuck on. */
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
