"use client";

import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import { useShakeOnInvalid } from "../../motion/jelly";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  type FieldProps,
} from "../field/Field";

export interface TextareaProps
  extends ComponentPropsWithRef<"textarea">, FieldProps {
  /**
   * Grows as you type (`field-sizing: content`). In browsers without support it stays
   * a normal, manually resizable field.
   */
  autoResize?: boolean;
}

export function Textarea({
  label,
  description,
  error,
  autoResize = false,
  rows = 3,
  id,
  className,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const field = useField({
    id,
    description,
    error,
    describedBy: ariaDescribedBy,
  });
  const boxRef = useShakeOnInvalid<HTMLDivElement>(field.invalid);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <FieldLabel htmlFor={field.id} required={required}>
          {label}
        </FieldLabel>
      )}
      <div
        ref={boxRef}
        data-invalid={field.invalid || undefined}
        className="plonk-field flex rounded-plonk-md"
      >
        <textarea
          {...props}
          id={field.id}
          rows={rows}
          required={required}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          className={cn(
            "min-h-[calc(3lh+1.25rem)] w-full resize-y bg-transparent px-3 py-2.5 text-base text-plonk-ink outline-none placeholder:text-plonk-ink-muted disabled:cursor-not-allowed",
            autoResize && "field-sizing-content max-h-80 resize-none",
          )}
        />
      </div>
      <FieldDescription id={field.descriptionId}>
        {description}
      </FieldDescription>
      <FieldError id={field.errorId}>{error}</FieldError>
    </div>
  );
}
