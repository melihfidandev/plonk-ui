import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { CodeBlock } from "@/site/code/CodeBlock";
import type { CodeLang } from "@/site/code/highlight";

/** Başlıktan bağlantı kimliği: "Loading state" → "loading-state". */
function slug(node: ReactNode): string {
  const text = (function flatten(n: ReactNode): string {
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(flatten).join("");
    if (isValidElement<{ children?: ReactNode }>(n))
      return flatten(n.props.children);
    return "";
  })(node);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function heading(Tag: "h2" | "h3") {
  return function Heading({ children }: ComponentPropsWithoutRef<"h2">) {
    const id = slug(children);
    return (
      <Tag id={id}>
        <a href={`#${id}`}>{children}</a>
      </Tag>
    );
  };
}

const components: MDXComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  a: ({ href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} {...props} />
    ),
  // Markdown tabloları: dar ekranda kendi içinde kayar, sayfa taşmaz.
  table: (props) => (
    <div className="site-table">
      <table {...props} />
    </div>
  ),
  // ```tsx kod çitleri: sunucuda renklendirilir, TS ise JS sekmesi eklenir.
  pre: ({ children }) => {
    const code = children as React.ReactElement<{
      className?: string;
      children?: string;
    }>;
    const lang = (code.props.className?.replace("language-", "") ??
      "tsx") as CodeLang;
    return <CodeBlock code={code.props.children ?? ""} lang={lang} />;
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
