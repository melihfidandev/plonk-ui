import { CodeTabs } from "./CodeTabs";
import { renderCode, type CodeLang } from "./highlight";

export interface CodeBlockProps {
  code: string;
  lang?: CodeLang;
}

/**
 * Renklendirilmiş kod kutusu. TS örneklerinde JS sürümü kendiliğinden üretilir
 * ve "TS | JS" sekmesi çıkar (iki sürüm aynıysa çıkmaz).
 */
export async function CodeBlock({ code, lang = "tsx" }: CodeBlockProps) {
  const { ts, js, tsHtml, jsHtml } = await renderCode(code, lang);
  return (
    <CodeTabs
      lang={lang}
      sources={js ? { ts, js } : { ts }}
      html={jsHtml ? { ts: tsHtml, js: jsHtml } : { ts: tsHtml }}
    />
  );
}
