"use client";

import { Input } from "plonk-ui";

const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export default function Icons() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <Input
        aria-label="Search projects"
        type="search"
        placeholder="Search projects"
        iconStart={<Search />}
      />
      <Input
        label="Budget"
        inputMode="decimal"
        defaultValue="1200"
        iconEnd={<span className="font-bold">USD</span>}
      />
      <Input
        label="Website"
        type="url"
        placeholder="studio.com"
        iconStart={<span className="font-bold">https://</span>}
      />
    </div>
  );
}
