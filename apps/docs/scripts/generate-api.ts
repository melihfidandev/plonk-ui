/**
 * Bileşenlerin TypeScript tiplerinden API tablosu verisi üretir:
 * src/generated/api.json. Elle yazılan tablo kodla zamanla ayrışırdı; böylece
 * prop eklenince ya da değişince tablo kendiliğinden güncellenir.
 *
 *   pnpm --filter docs api          → dosyayı yazar
 *   pnpm --filter docs api --check  → dosya güncel değilse hata verir (CI)
 *
 * Tabloya kendi prop'larımız ve src/content/api.ts'te seçilen kalıtsal
 * (React Aria) prop'lar girer. Açıklaması eksik ya da artık var olmayan
 * prop'lar uyarı olarak yazılır.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withCustomConfig, type PropItem } from "react-docgen-typescript";
import { API } from "../src/content/api";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = path.resolve(here, "../../../packages/plonk");
const out = path.resolve(here, "../src/generated/api.json");

export interface ApiProp {
  name: string;
  type: string;
  default?: string;
  required: boolean;
  inherited: boolean;
}

const files = readdirSync(path.join(lib, "src/components"), {
  recursive: true,
  encoding: "utf8",
})
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
  .map((f) => path.join(lib, "src/components", f))
  .sort();

const parser = withCustomConfig(path.join(lib, "tsconfig.json"), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
});

const isOwn = (prop: PropItem) =>
  prop.declarations?.some((d) => !d.fileName.includes("node_modules")) ?? false;

function typeOf(prop: PropItem): string {
  const { name, value } = prop.type;
  if (name === "enum" && Array.isArray(value)) {
    return value.map((v: { value: string }) => v.value).join(" | ");
  }
  // "((e: PressEvent) => void)" → "(e: PressEvent) => void"
  return name.replace(/^\(([\s\S]*)\)$/, "$1");
}

function defaultOf(prop: PropItem): string | undefined {
  const raw = prop.defaultValue?.value;
  if (raw == null || raw === "") return undefined;
  const value = String(raw).replace(/^'(.*)'$/, '"$1"');
  // Yapıdan gelen varsayılan tırnaksız gelir: dizgi birleşiminde tırnakla.
  return prop.type.name === "enum" && /^[A-Za-z]/.test(value)
    ? `"${value}"`
    : value;
}

const result: Record<string, ApiProp[]> = {};
const warnings: string[] = [];

for (const doc of parser.parse(files)) {
  const name = doc.displayName;
  if (!/^[A-Z]/.test(name) || result[name]) continue;
  const content = API[name];
  const hidden = new Set(content?.hidden ?? []);
  const own = Object.values(doc.props).filter(
    (p) => isOwn(p) && p.name !== "children" && !hidden.has(p.name),
  );
  const inherited = (content?.inherited ?? []).flatMap((key) => {
    const prop = doc.props[key];
    if (!prop) warnings.push(`${name}: inherited prop "${key}" not found`);
    return prop ? [prop] : [];
  });
  result[name] = [...own, ...inherited].map((p) => ({
    name: p.name,
    type: content?.types?.[p.name] ?? typeOf(p),
    ...(defaultOf(p) !== undefined && { default: defaultOf(p) }),
    required: p.required,
    inherited: !isOwn(p),
  }));

  if (content) {
    for (const prop of result[name]) {
      if (!content.props[prop.name]) {
        warnings.push(`${name}: missing description for "${prop.name}"`);
      }
    }
    for (const key of Object.keys(content.props)) {
      if (!result[name].some((p) => p.name === key)) {
        warnings.push(`${name}: description for unknown prop "${key}"`);
      }
    }
  }
}

for (const key of Object.keys(API)) {
  if (!result[key]) warnings.push(`${key}: component not found`);
}

const json = `${JSON.stringify(result, null, 2)}\n`;
for (const warning of warnings) console.warn(`⚠ ${warning}`);

if (process.argv.includes("--check")) {
  const current = readFileSync(out, "utf8");
  if (current !== json) {
    console.error("api.json is out of date: run `pnpm --filter docs api`.");
    process.exit(1);
  }
  console.log("api.json is up to date.");
} else {
  writeFileSync(out, json);
  console.log(
    `api.json: ${Object.keys(result).length} components → ${path.relative(process.cwd(), out)}`,
  );
}
