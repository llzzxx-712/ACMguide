import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://llzzxx-712.github.io',
  base: '/ACMguide',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: 'error', trust: false, output: 'htmlAndMathml' }]]
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } }
  }
});
