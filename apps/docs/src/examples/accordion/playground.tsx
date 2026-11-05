"use client";

import { Accordion, AccordionItem } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Accordion sayfasının oyun alanı. */
export default function AccordionPlayground() {
  return (
    <Playground
      component="Accordion"
      controls={{
        allowsMultipleExpanded: { type: "boolean", default: false },
        isDisabled: { type: "boolean", default: false },
      }}
      childrenCode={[
        '<AccordionItem id="ship" title="When does it ship?">',
        "  Orders leave the studio within two days.",
        "</AccordionItem>",
        '<AccordionItem id="return" title="Can I return it?">',
        "  Yes, for 30 days.",
        "</AccordionItem>",
      ].join("\n")}
      render={(props) => (
        <Accordion className="w-full max-w-sm" {...props}>
          <AccordionItem id="ship" title="When does it ship?">
            Orders leave the studio within two days.
          </AccordionItem>
          <AccordionItem id="return" title="Can I return it?">
            Yes, for 30 days.
          </AccordionItem>
        </Accordion>
      )}
    />
  );
}
