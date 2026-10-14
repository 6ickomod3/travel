import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://6ickomod3.github.io',
  base: process.env.BASE_PATH || '/travel/',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  devToolbar: { enabled: false },
  prefetch: { defaultStrategy: 'hover' },
});
