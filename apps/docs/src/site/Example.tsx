import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { EXAMPLES, type ExampleName } from "@/examples";
import { CodeBlock } from "./code/CodeBlock";
import { Exhibit, type ExhibitProps } from "./Exhibit";

/**
 * Örneğin kaynak kodu. Önbellekli: Cache Components ön-render sırasında dosya
 * okumayı da "önbelleksiz veri" sayar; kod build'de bir kez okunur.
 */
async function readSource(name: ExampleName) {
  "use cache";
  // Kod sadece yeni build'de değişir.
  cacheLife("max");
  const source = await readFile(
    path.join(process.cwd(), "src/examples", `${name}.tsx`),
    "utf8",
  );
  // "use client" satırı okuyucu için gürültü.
  return source.replace(/^"use client";\s*/, "");
}

/**
 * Bir örnek: canlı eser + kaynak kodu. Kod, örnek dosyanın kendisinden okunur
 * (src/examples/<ad>.tsx): gösterilen kod ile çalışan kod hiç ayrışmaz.
 */
export async function Example({
  name,
  title,
  ...props
}: { name: ExampleName; title: string } & Pick<
  ExhibitProps,
  "align" | "toaster"
>) {
  const Component = EXAMPLES[name];
  const code = await readSource(name);
  return (
    <Exhibit
      title={title}
      footer={<CodeBlock code={code} lang="tsx" />}
      {...props}
    >
      <Component />
    </Exhibit>
  );
}
