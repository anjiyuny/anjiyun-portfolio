import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fg from 'fast-glob';

const REPO = '/anjiyun-portfolio/';

// index.html + project/*.html 을 자동으로 전부 빌드 대상에 넣는다
const pages = Object.fromEntries(
  fg
    .sync(['index.html', 'project/*.html'])
    .map((f) => [f.replace(/\.html$/, '').replace(/\//g, '-'), resolve(process.cwd(), f)])
);

export default defineConfig(({ command }) => ({
  root: '.',
  base: command === 'build' ? REPO : '/',
  server: { open: true },
  build: { outDir: 'dist', rollupOptions: { input: pages } },
}));
