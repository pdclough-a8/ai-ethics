import { defineConfig } from 'astro/config';

// GitHub Pages serves this as a project site - https://pdclough-a8.github.io/ai-ethics/ -
// not the domain root, so `base` has to match. Any hardcoded internal link/asset
// path (nav hrefs, image src from content JSON) must go through withBase()
// (src/scripts/paths.ts) rather than being a plain "/..." string, since Astro
// only auto-prefixes URLs it generates itself, not ones we write by hand.
export default defineConfig({
  output: 'static',
  site: 'https://pdclough-a8.github.io',
  base: '/ai-ethics',
  // Astro's default build.assets ("_astro") is left as-is here - do NOT
  // override it to something like "assets", which collides with
  // public/assets/ (our content images copy into the same output folder).
});
