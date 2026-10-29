import "server-only";
import { cacheLife } from "next/cache";
import * as prettier from "prettier";
import { createHighlighter, type Highlighter } from "shiki";
import { blankSourceFile } from "ts-blank-space";
import typescript from "typescript";

/*
 * Kod kutuları sunucuda (build'de) renklendirilir: tarayıcıya sadece hazır HTML
 * gider. Kod kutusu iki modda da koyu olduğu için tek tema yeter.
 */
const THEME = "github-dark-default";
const LANGS = ["tsx", "ts", "jsx", "js", "bash", "css", "json"] as const;
export type CodeLang = (typeof LANGS)[number];

let highlighter: Promise<Highlighter> | undefined;
const getHighlighter = () =>
  (highlighter ??= createHighlighter({ themes: [THEME], langs: [...LANGS] }));

async function highlight(code: string, lang: CodeLang) {
  return (await getHighlighter()).codeToHtml(code, { lang, theme: THEME });
}

const FORMAT: prettier.Options = { printWidth: 80 };

/*
 * ts-blank-space'in varsayılanı kodu .ts sayar: JSX'teki `<DatePicker …>`'ı tip
 * dönüşümü sanıp içindeki ifadeleri siliyordu. Dosya türünü biz veriyoruz.
 */
function stripTypes(code: string, lang: "ts" | "tsx") {
  const { ScriptKind, ScriptTarget, createSourceFile } = typescript;
  const source = createSourceFile(
    `example.${lang}`,
    code,
    ScriptTarget.ESNext,
    false,
    lang === "tsx" ? ScriptKind.TSX : ScriptKind.TS,
  );
  return blankSourceFile(source);
}

/**
 * TypeScript örneğinden JavaScript sürümü: tipler silinir (ts-blank-space,
 * satırlar yerinde kalır), sonra iki sürüm de aynı biçimle düzenlenir. JS
 * sürümü TS'ten farklı değilse `null`: sekme gösterilmez.
 */
async function withJavaScript(code: string, lang: CodeLang) {
  if (lang !== "ts" && lang !== "tsx") return { ts: code.trimEnd(), js: null };
  const ts = (
    await prettier.format(code, { ...FORMAT, parser: "typescript" })
  ).trimEnd();
  const js = (
    await prettier.format(stripTypes(ts, lang), { ...FORMAT, parser: "babel" })
  ).trimEnd();
  return { ts, js: js === ts ? null : js };
}

/**
 * Bir kod kutusunun her şeyi: düzenlenmiş TS, varsa JS ve ikisinin HTML'i.
 * Önbellekli ("use cache"): her kutu build'de bir kez hesaplanır. Shiki içeride
 * Date.now() okuyor; Cache Components bunu ön-render'da sadece önbellekli
 * fonksiyonlarda kabul ediyor.
 */
export async function renderCode(code: string, lang: CodeLang) {
  "use cache";
  // Kod sadece yeni build'de değişir.
  cacheLife("max");
  const { ts, js } = await withJavaScript(code, lang);
  const [tsHtml, jsHtml] = await Promise.all([
    highlight(ts, lang),
    js ? highlight(js, lang === "tsx" ? "jsx" : "js") : null,
  ]);
  return { ts, js, tsHtml, jsHtml };
}
