import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Test uygulaması bilerek tek parça; boyut uyarısı CI kaydını kirletmesin.
  build: { chunkSizeWarningLimit: 5000 },
});
