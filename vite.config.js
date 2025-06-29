import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { //111
    outDir: "dist",
    emptyOutDir: true,
  },
});
