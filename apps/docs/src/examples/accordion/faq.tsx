"use client";

import { Accordion, AccordionItem } from "plonk";

const FAQ = [
  {
    id: "free",
    q: "Is Plonk free?",
    a: "Yes. It's open source under the MIT license.",
  },
  {
    id: "tailwind",
    q: "Do I need Tailwind?",
    a: "Yes, Plonk's components are styled with Tailwind v4 and CSS variables.",
  },
  {
    id: "personality",
    q: "Can I mix personalities?",
    a: "Yes. Nest providers and each part of the page keeps its own.",
  },
];

export default function Faq() {
  return (
    <Accordion className="w-full max-w-sm" defaultExpandedKeys={["free"]}>
      {FAQ.map(({ id, q, a }) => (
        <AccordionItem key={id} id={id} title={q} headingLevel={4}>
          {a}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
