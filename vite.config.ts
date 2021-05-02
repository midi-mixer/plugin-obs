// public
import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default defineConfig({
  base: "./",
  build: {
    sourcemap: true,
  },
  plugins: [
    copy({
      targets: [
        {
          src: "./plugin.json",
          dest: "dist/",
        },
        {
          src: "./PAGE.md",
          dest: "dist/",
        },
      ],
      hook: "writeBundle",
    }),
    nodePolyfills(),
  ],
});
