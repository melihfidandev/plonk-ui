import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  // Bileşenler hook kullandığı için RSC tarafında istemci bileşeni sayılmalı.
  banner: { js: '"use client";' },
  onSuccess: () => copyFile("src/theme.css", "dist/theme.css"),
});
