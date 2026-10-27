"use client";

import { useRef, type ChangeEvent, type ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import { playJelly } from "../../motion/jelly";
import {
  FieldDescription,
  FieldLabel,
  useField,
  type FieldProps,
} from "../field/Field";

export interface SwitchProps
  extends
    Omit<ComponentPropsWithRef<"input">, "type" | "size" | "role">,
    Omit<FieldProps, "error"> {}

/**
 * Anında etki eden açık/kapalı ayarı. Topuz karşıya yayla geçer ve
 * yolda ezilip uzar. Form içinde normal bir checkbox gibi gönderilir.
 */
export function Switch({
  label,
  description,
  id,
  className,
  onChange,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SwitchProps) {
  const field = useField({ id, description, describedBy: ariaDescribedBy });
  const knobRef = useRef<HTMLSpanElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (knobRef.current) playJelly(knobRef.current, "squish");
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <span className="group relative inline-flex h-8 w-14 shrink-0">
          <input
            {...props}
            type="checkbox"
            role="switch"
            id={field.id}
            aria-describedby={field.describedBy}
            onChange={handleChange}
            className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none rounded-plonk-pill outline-offset-3 focus-visible:outline-3 focus-visible:outline-plonk-focus disabled:cursor-not-allowed"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-plonk-pill bg-plonk-sunken transition-colors plonk-motion-snap plonk-border group-has-checked:bg-plonk-success group-has-disabled:border-dashed!"
          />
          <span
            aria-hidden="true"
            className="absolute top-1 left-1 size-6 [transition-property:translate] plonk-motion-snap group-has-checked:translate-x-6"
          >
            <span
              ref={knobRef}
              className="block size-full rounded-plonk-pill bg-plonk-surface plonk-border group-has-disabled:bg-plonk-sunken"
            />
          </span>
        </span>
        {label && (
          <FieldLabel
            htmlFor={field.id}
            className="cursor-pointer pt-1 text-base font-semibold"
          >
            {label}
          </FieldLabel>
        )}
      </div>
      <FieldDescription id={field.descriptionId} className="pl-[4.25rem]">
        {description}
      </FieldDescription>
    </div>
  );
}
