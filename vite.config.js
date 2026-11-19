import { defineConfig } from "vite";

const nativeBuild = process.env.CAPACITOR_BUILD === "1";

export default defineConfig({
  base: nativeBuild ? "./" : "/arcadias-/",
  build: { outDir: "dist", sourcemap: true }
});
