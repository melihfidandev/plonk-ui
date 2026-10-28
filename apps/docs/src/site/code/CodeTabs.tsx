"use client";

import { useState } from "react";
import { Tab, TabList, Tabs } from "react-aria-components";
import { createStore } from "../store";

type Lang = "ts" | "js";

/** Seçilen dil bütün kod kutularında ortak ve hatırlanır. */
const codeLanguage = createStore<Lang>("plonk-docs-lang", "ts", ["ts", "js"]);

const LABELS: Record<string, string> = {
  tsx: "TSX",
  ts: "TS",
  jsx: "JSX",
  js: "JS",
  bash: "Terminal",
  css: "CSS",
  json: "JSON",
};

export function CodeTabs({
  lang,
  sources,
  html,
}: {
  lang: string;
  sources: { ts: string; js?: string };
  html: { ts: string; js?: string };
}) {
  const preferred = codeLanguage.use();
  const hasJs = sources.js !== undefined;
  const current: Lang = hasJs ? preferred : "ts";

  return (
    <div className="site-code">
      <div className="site-code-bar">
        {hasJs ? (
          <Tabs
            selectedKey={current}
            onSelectionChange={(key) => codeLanguage.set(key as Lang)}
          >
            <TabList aria-label="Language" style={{ display: "flex", gap: 4 }}>
              <Tab id="ts">TS</Tab>
              <Tab id="js">JS</Tab>
            </TabList>
          </Tabs>
        ) : (
          <span className="lang">{LABELS[lang] ?? lang}</span>
        )}
        <CopyButton text={(current === "js" && sources.js) || sources.ts} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html[current] ?? html.ts }} />
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="site-copy"
      data-copied={copied || undefined}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
