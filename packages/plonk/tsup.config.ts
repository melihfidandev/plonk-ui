import { copyFile, cp } from "node:fs/promises";
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
  onSuccess: async () => {
    await copyFile("src/theme.css", "dist/theme.css");
    await copyFile("src/personalities.css", "dist/personalities.css");
    await copyFile("src/fonts.css", "dist/fonts.css");
    await cp("src/fonts", "dist/fonts", { recursive: true });
  },
});
