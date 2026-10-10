import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file build: JS, CSS and fonts are inlined into dist/index.html so it also opens
// straight from disk (file://). Images and video stay as files in dist/assets.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: { assetsInlineLimit: 100000000, cssCodeSplit: false },
});
