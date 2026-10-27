"use client";

import { useRef, type ReactNode } from "react";
import {
  Button as AriaButton,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type DisclosureGroupProps,
  type DisclosureProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { playJelly } from "../../motion/jelly";
import { Chevron } from "../select/Select";

export interface AccordionProps extends Omit<
  DisclosureGroupProps,
  "className" | "style"
> {
  className?: string;
}

/**
 * Açılır kapanır bölümler. Varsayılan olarak aynı anda bir bölüm açık;
 * `allowsMultipleExpanded` ile birden çok.
 */
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <DisclosureGroup
      {...props}
      className={cn("plonk-accordion flex flex-col gap-3", className)}
    />
  );
}

export interface AccordionItemProps extends Omit<
  DisclosureProps,
  "className" | "style" | "children"
> {
  title: ReactNode;
  children: ReactNode;
  /** Başlık etiketinin seviyesi (sayfadaki başlık sırasına uysun diye). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/** Tek bölüm. Yükseklik yayla açılır, ok döner ve ezilir. */
export function AccordionItem({
  title,
  children,
  headingLevel = 3,
  className,
  ...props
}: AccordionItemProps) {
  const chevronRef = useRef<HTMLSpanElement>(null);

  return (
    <Disclosure
      {...props}
      className={cn(
        "plonk-accordion-item rounded-plonk-md bg-plonk-surface text-plonk-ink plonk-shadow plonk-border",
        className,
      )}
    >
      <Heading level={headingLevel}>
        <AriaButton
          slot="trigger"
          onPress={() => chevronRef.current && playJelly(chevronRef.current)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left font-plonk-display text-lg leading-tight outline-none data-disabled:cursor-not-allowed data-focus-visible:outline-3 data-focus-visible:outline-offset-2 data-focus-visible:outline-plonk-focus"
        >
          <span className="min-w-0 flex-1">{title}</span>
          <span ref={chevronRef} className="inline-grid">
            <Chevron />
          </span>
        </AriaButton>
      </Heading>
      <DisclosurePanel className="plonk-accordion-panel">
        <div className="px-4 pb-4 text-plonk-ink">{children}</div>
      </DisclosurePanel>
    </Disclosure>
  );
}
