import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Resolve the local package source directly so changes to
  // the parent src/ are reflected immediately without rebuilding.
  resolve: {
    alias: {
      "CollectTwirlingBits": resolve(__dirname, "../src/index.ts"),
    },
  },
});
