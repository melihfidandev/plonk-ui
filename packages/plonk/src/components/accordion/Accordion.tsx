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
 * Collapsible sections. One section is open at a time by default;
 * `allowsMultipleExpanded` allows several.
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
  /** Level of the heading element (to fit the page's heading order). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/** A single section. Its height opens with a spring, the chevron turns and squishes. */
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
          className="plonk-accordion-trigger flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left font-plonk-display text-lg leading-tight outline-none data-disabled:cursor-not-allowed data-focus-visible:outline-3 data-focus-visible:outline-offset-2 data-focus-visible:outline-plonk-focus data-focus-visible:outline-solid"
        >
          <span className="plonk-accordion-title me-auto min-w-0">{title}</span>
          <span ref={chevronRef} className="inline-grid">
            <Chevron />
          </span>
        </AriaButton>
      </Heading>
      <DisclosurePanel className="plonk-accordion-panel">
        <div className="plonk-accordion-body px-4 pb-4 text-plonk-ink">
          {children}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
