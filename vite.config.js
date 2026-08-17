import { defineConfig } from 'vite';

// GitHub Pages 는 https://anjiyuny.github.io/anjiyun-portfolio/ 하위 경로로 서빙되므로
// build 시에만 base 를 붙인다. (dev 는 '/' 유지 — 안 그러면 로컬 주소가 지저분해짐)
const REPO = '/anjiyun-portfolio/';

export default defineConfig(({ command }) => ({
  root: '.',
  base: command === 'build' ? REPO : '/',
  server: { open: true },
  build: { outDir: 'dist' },
}));
