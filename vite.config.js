import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

const REPO = '/anjiyun-portfolio/';

const PROJECT_DIR = 'project';
const pages = { index: resolve(process.cwd(), 'index.html') };

if (existsSync(PROJECT_DIR)) {
  for (const file of readdirSync(PROJECT_DIR)) {
    if (!file.endsWith('.html')) continue;
    const name = `project-${file.replace(/\.html$/, '')}`;
    pages[name] = resolve(process.cwd(), PROJECT_DIR, file);
  }
}

export default defineConfig(({ command }) => ({
  root: '.',
  base: command === 'build' ? REPO : '/',
  server: { open: true },
  build: { outDir: 'dist', rollupOptions: { input: pages } },
}));
