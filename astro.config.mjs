import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// GitHub Pages 部署配置
const GITHUB_USERNAME = 'xzjsyjl';

// https://astro.build/config
export default defineConfig({
  site: `https://${GITHUB_USERNAME}.github.io`,
  base: '/',
  integrations: [vue(), mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});