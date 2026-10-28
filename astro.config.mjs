import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax/svg';
import { captureMathSources, labelMathOutput } from './src/lib/math-labels.mjs';

export default defineConfig({
  site: 'https://llzzxx-712.github.io',
  base: '/ACMguide',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        captureMathSources,
        [rehypeMathjax, {
          tex: {
            packages: ['base', 'ams', 'newcommand', 'configmacros', 'boldsymbol']
          },
          svg: { fontCache: 'local', displayAlign: 'center' }
        }],
        labelMathOutput
      ]
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } }
  }
});
