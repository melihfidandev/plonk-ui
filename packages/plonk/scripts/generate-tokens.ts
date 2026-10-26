import { writeFileSync } from "node:fs";
import { buildPersonalitiesCss } from "../src/tokens/css";

const target = new URL("../src/personalities.css", import.meta.url);
writeFileSync(target, buildPersonalitiesCss());
console.log("✓ src/personalities.css üretildi");
