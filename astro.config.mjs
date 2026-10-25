import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://llzzxx-712.github.io',
  base: '/ACMguide',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } }
  }
});
