// Derlenen CSS'te Plonk'un token'ları ve bileşen sınıfları var mı (Tailwind paketi taradı mı)?
import { readdirSync, readFileSync } from "node:fs";

const dir = "dist/assets";
const css = readdirSync(dir)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(`${dir}/${f}`, "utf8"))
  .join("\n");
const fonts = readdirSync(dir).filter((f) => f.endsWith(".woff2"));

const expected = [
  "--plonk-color-primary",
  ".plonk-pressable",
  "bg-plonk-primary",
];
const missing = expected.filter((s) => !css.includes(s));
if (missing.length || fonts.length === 0) {
  console.error("Missing in the built CSS:", missing, "fonts:", fonts.length);
  process.exit(1);
}
console.log(
  `OK: tokens, utilities and ${fonts.length} font files are in the build.`,
);
