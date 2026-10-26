"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useShakeOnInvalid } from "../../motion/jelly";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  type FieldProps,
} from "../field/Field";

export interface InputProps
  extends Omit<ComponentPropsWithRef<"input">, "size">, FieldProps {
  /** Alanın başındaki ikon (arama büyüteci gibi). */
  iconStart?: ReactNode;
  /** Alanın sonundaki ikon ya da ek (birim, kısayol…). */
  iconEnd?: ReactNode;
}

/**
 * Odaklanınca yerinden kalkar ve odak renginde sert bir gölge bırakır.
 * Hata gelince "hayır" der gibi sallanır.
 */
export function Input({
  label,
  description,
  error,
  iconStart,
  iconEnd,
  id,
  className,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const field = useField({
    id,
    description,
    error,
    describedBy: ariaDescribedBy,
  });
  const boxRef = useShakeOnInvalid<HTMLDivElement>(field.invalid);

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <FieldLabel htmlFor={field.id} required={required}>
          {label}
        </FieldLabel>
      )}
      <div
        ref={boxRef}
        data-invalid={field.invalid || undefined}
        className="plonk-field flex h-11 items-center gap-2 rounded-plonk-md px-3"
      >
        {iconStart && <Adornment>{iconStart}</Adornment>}
        <input
          {...props}
          id={field.id}
          required={required}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-plonk-ink outline-none placeholder:text-plonk-ink-muted disabled:cursor-not-allowed"
        />
        {iconEnd && <Adornment>{iconEnd}</Adornment>}
      </div>
      <FieldDescription id={field.descriptionId}>
        {description}
      </FieldDescription>
      <FieldError id={field.errorId}>{error}</FieldError>
    </div>
  );
}

function Adornment({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 text-plonk-ink-muted [&>svg]:size-[1.15em]"
    >
      {children}
    </span>
  );
}
