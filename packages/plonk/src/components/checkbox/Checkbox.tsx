"use client";

import type { ChangeEvent, ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import { mergeRefs } from "../../lib/merge-refs";
import { playJelly, useShakeOnInvalid } from "../../motion/jelly";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  type FieldProps,
} from "../field/Field";

export interface CheckboxProps
  extends Omit<ComponentPropsWithRef<"input">, "type" | "size">, FieldProps {
  /** "Bazıları seçili" hâli (tümünü seç kutuları için). */
  indeterminate?: boolean;
}

/** İşaretlenince tik çizilerek gelir, kutu jöle gibi esner. */
export function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  id,
  className,
  required,
  ref,
  onChange,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const field = useField({
    id,
    description,
    error,
    describedBy: ariaDescribedBy,
  });
  const boxRef = useShakeOnInvalid<HTMLSpanElement>(field.invalid);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (boxRef.current) playJelly(boxRef.current);
  };

  return (
    <div className={cn("grid gap-1", className)}>
      <div className="flex items-start gap-3">
        <span
          ref={boxRef}
          className="relative grid size-6 shrink-0 place-items-center"
        >
          <input
            {...props}
            ref={mergeRefs(ref, (el) => {
              if (el) el.indeterminate = indeterminate;
            })}
            type="checkbox"
            id={field.id}
            required={required}
            aria-invalid={field.invalid || undefined}
            aria-describedby={field.describedBy}
            onChange={handleChange}
            className="plonk-control peer size-full cursor-pointer rounded-plonk-sm checked:bg-plonk-primary indeterminate:bg-plonk-primary"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute size-4 text-plonk-on-primary"
          >
            <path
              className="plonk-check-mark"
              pathLength={1}
              d="M4.5 12.5 9.5 17.5 19.5 6.5"
            />
            <path className="plonk-dash-mark" pathLength={1} d="M6 12h12" />
          </svg>
        </span>
        {label && (
          <FieldLabel
            htmlFor={field.id}
            required={required}
            className="cursor-pointer pt-0.5 text-base font-semibold"
          >
            {label}
          </FieldLabel>
        )}
      </div>
      <FieldDescription id={field.descriptionId} className="pl-9">
        {description}
      </FieldDescription>
      <FieldError id={field.errorId}>{error}</FieldError>
    </div>
  );
}
