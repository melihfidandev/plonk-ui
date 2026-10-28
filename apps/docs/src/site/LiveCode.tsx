"use client";

import { CopyButton } from "./code/CodeTabs";

/**
 * Sergilerin altında, kontrollerle birlikte değişen kısa kod. Renklendirme
 * yok: birkaç satırlık CSS/JSX için Shiki'yi tarayıcıya taşımaya değmez.
 */
export function LiveCode({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="site-code">
      <div className="site-code-bar">
        <span className="lang">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
