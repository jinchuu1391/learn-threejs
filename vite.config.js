import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        webglFundamentals: resolve(__dirname, "src/webgl-fundamentals.html"),
      },
    },
  },
  plugins: [glsl()],
  base: "/learn-threejs/",
});
