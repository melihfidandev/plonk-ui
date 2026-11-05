"use client";

import {
  createContext,
  use,
  useId,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { playJelly, useShakeOnInvalid } from "../../motion/jelly";
import {
  FieldDescription,
  FieldError,
  useField,
  type FieldProps,
} from "../field/Field";

interface RadioGroupContext {
  name: string;
  /** `undefined`: uncontrolled. `null`: controlled, nothing selected. */
  value: string | null | undefined;
  defaultValue: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
}

const RadioContext = createContext<RadioGroupContext | null>(null);

export interface RadioGroupProps
  extends
    Omit<ComponentPropsWithRef<"fieldset">, "defaultValue" | "onChange">,
    FieldProps {
  /** Name used in form submission. Generated automatically when omitted. */
  name?: string;
  /**
   * Selected value for controlled use. `null` when nothing is selected
   * (passing `undefined` makes the group uncontrolled).
   */
  value?: string | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
}

/**
 * A group of options. Arrow-key navigation comes from the browser's native radio
 * behavior.
 */
export function RadioGroup({
  label,
  description,
  error,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  required = false,
  orientation = "vertical",
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioGroupProps) {
  const autoName = useId();
  const field = useField({ description, error, describedBy: ariaDescribedBy });
  const shakeRef = useShakeOnInvalid<HTMLDivElement>(field.invalid);

  return (
    <fieldset
      {...props}
      disabled={disabled}
      aria-describedby={field.describedBy}
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
    >
      {label && (
        <legend className="mb-1.5 text-sm font-bold text-plonk-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-plonk-ink-muted">
              *
            </span>
          )}
        </legend>
      )}
      <FieldDescription id={field.descriptionId} className="-mt-1 mb-1">
        {description}
      </FieldDescription>
      <RadioContext
        value={{
          name: name ?? autoName,
          value,
          defaultValue,
          onValueChange,
          disabled,
          required,
          invalid: field.invalid,
        }}
      >
        <div
          ref={shakeRef}
          className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-wrap gap-x-6",
          )}
        >
          {children}
        </div>
      </RadioContext>
      <FieldError id={field.errorId} className="mt-1">
        {error}
      </FieldError>
    </fieldset>
  );
}

export interface RadioProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "name" | "value" | "checked" | "defaultChecked"
> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
}

/** When selected, the inner dot grows in with a spring. */
export function Radio({
  value,
  label,
  description,
  id,
  className,
  onChange,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioProps) {
  const group = use(RadioContext);
  if (!group) throw new Error("<Radio> bir <RadioGroup> içinde olmalı.");
  const field = useField({ id, description, describedBy: ariaDescribedBy });
  const dotRef = useRef<HTMLSpanElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    group.onValueChange?.(value);
    if (dotRef.current) playJelly(dotRef.current);
  };

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex items-start gap-3">
        <span
          ref={dotRef}
          className="relative grid size-6 shrink-0 place-items-center"
        >
          <input
            {...props}
            type="radio"
            id={field.id}
            name={group.name}
            value={value}
            checked={
              group.value === undefined ? undefined : group.value === value
            }
            defaultChecked={
              group.defaultValue === undefined
                ? undefined
                : group.defaultValue === value
            }
            disabled={disabled || group.disabled}
            required={group.required}
            aria-invalid={group.invalid || undefined}
            aria-describedby={field.describedBy}
            onChange={handleChange}
            className="plonk-control peer size-full cursor-pointer rounded-plonk-pill checked:bg-plonk-primary"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-2.5 scale-0 rounded-plonk-pill bg-plonk-on-primary [transition-property:scale] plonk-motion-spring peer-checked:scale-100"
          />
        </span>
        {label && (
          <label
            htmlFor={field.id}
            className="cursor-pointer pt-0.5 text-base font-semibold text-plonk-ink"
          >
            {label}
          </label>
        )}
      </div>
      <FieldDescription id={field.descriptionId} className="pl-9">
        {description}
      </FieldDescription>
    </div>
  );
}
