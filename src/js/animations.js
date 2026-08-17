import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const floatScale = reduceMotion ? 0.4 : 1;

/* =========================================================
    1) 마우스 두둥실 (TV + 스마일) — 항상 실행
   ========================================================= */
const tvEl = document.querySelector('.tv'); // 두둥실 대상
const smileEl = document.querySelector('.smile'); // 스마일 그룹도 동일 이동
let pMouseX = 0,
  pMouseY = 0,
  curX = 0,
  curY = 0;
let floatAmount = 1; // 스크롤 시작 시 0으로 감소

window.addEventListener('pointermove', (e) => {
  pMouseX = e.clientX / window.innerWidth - 0.5;
  pMouseY = e.clientY / window.innerHeight - 0.5;
});

function floatLoop(t) {
  const idleX = Math.cos(t / 1100) * 6 * floatAmount * floatScale;
  const idleY = Math.sin(t / 900) * 9 * floatAmount * floatScale;
  const targetX = pMouseX * 46 * floatAmount * floatScale + idleX;
  const targetY = pMouseY * 46 * floatAmount * floatScale + idleY;
  curX += (targetX - curX) * 0.06;
  curY += (targetY - curY) * 0.06;
  const tf = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
  if (tvEl) tvEl.style.transform = tf;
  if (smileEl) smileEl.style.transform = tf;
  requestAnimationFrame(floatLoop);
}
requestAnimationFrame(floatLoop);

/* =========================================================
    2) HERO → PROJECTS 타임라인 (pin + scrub)
   ========================================================= */
gsap.set('.smile__icon', { xPercent: -50, yPercent: -50 });
gsap.set('.projects__title', { xPercent: -50, yPercent: -50, visibility: 'visible', autoAlpha: 0 });

// Projects 타이틀 최종 위치(상단). 숫자↑ = 더 아래.
const PROJECTS_END_Y = () => -(window.innerHeight / 2 - 118);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '+=7600',
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      floatAmount = 1 - Math.min(self.progress / 0.15, 1);
    },
  },
});

/* Phase A — TV 수평정렬 */
tl.to('.tv__body', { rotation: 0, ease: 'power2.out', duration: 1 }, 0);
tl.to('.hero__scroll', { autoAlpha: 0, duration: 0.3 }, 0);

/* Phase B — 원 → 둥근 사각형 → 풀스크린 배경 확장 */
gsap.set('.reveal', { width: 140, height: 140, borderRadius: 9999, autoAlpha: 0 });
tl.set('.reveal', { autoAlpha: 1 }, 1.1);
tl.to('.smile__glow', { autoAlpha: 0, duration: 0.4 }, 1.1);
tl.to('.reveal', { width: 460, height: 460, ease: 'power1.inOut', duration: 0.6 }, 1.1); // 원 성장
tl.to(
  '.reveal',
  {
    width: () => window.innerWidth,
    height: () => window.innerHeight,
    ease: 'power2.inOut',
    duration: 0.85,
  },
  1.7
); // 풀스크린
tl.to('.reveal', { borderRadius: 40, ease: 'power2.out', duration: 0.45 }, 1.7); // 둥근 사각형
tl.to('.reveal', { borderRadius: 0, ease: 'power2.in', duration: 0.35 }, 2.2); // 각짐
tl.to('.hero__title, .hero__desc, .hero__grid', { autoAlpha: 0, duration: 0.5 }, 1.0);
tl.to('.tv__frame, .tv__screen', { autoAlpha: 0, duration: 0.6 }, 1.2);

/* Phase C — Projects 타이틀 상단 고정 + 스마일 위로 */
tl.fromTo(
  '.projects__title',
  { y: () => window.innerHeight * 0.6, autoAlpha: 0 },
  { y: PROJECTS_END_Y, autoAlpha: 1, ease: 'power2.out', duration: 0.9 },
  1.75
);
tl.to(
  '.smile__icon',
  { y: () => -window.innerHeight * 0.62, ease: 'power2.in', duration: 0.9 },
  1.75
);
tl.to('.smile__icon', { autoAlpha: 0, duration: 0.25 }, 2.4);

const SPARKLE_START = 2.55; // 카드 등장(2.8) 보다 살짝 먼저
const SPARKLE_GAP = 1; // 01 → 02 → 03 간격
const SPARKLE_FROM = [
  { x: 46, y: 30 },
  { x: -46, y: 30 },
  { x: 46, y: -30 },
];

gsap.utils.toArray('.projects__sparkle').forEach((sp, i) => {
  const from = SPARKLE_FROM[i] || { x: 0, y: 0 };
  const ease = reduceMotion ? 'power2.out' : 'back.out(1.5)';
  tl.fromTo(
    sp,
    {
      autoAlpha: 0,
      scale: reduceMotion ? 0.9 : 0.45,
      rotation: reduceMotion ? 0 : -10,
      x: from.x * floatScale,
      y: from.y * floatScale,
    },
    { autoAlpha: 1, scale: 1, rotation: 0, x: 0, y: 0, ease, duration: 1.2 },
    SPARKLE_START + i * SPARKLE_GAP
  );
});

/* Phase D — 카드가 '보이지 않는 물결 선'을 타고 우→좌로 이동 */
const WAVE = { A: 78, WAVELEN: 0.52, PHASE: 0.7, MIDY: 0.52, BANK: 0.4 };
const waveK = () => (2 * Math.PI) / (window.innerWidth * WAVE.WAVELEN);
const waveY = (x) => window.innerHeight * WAVE.MIDY + WAVE.A * Math.sin(waveK() * x + WAVE.PHASE);
const waveDeg = (x) =>
  Math.atan(WAVE.A * waveK() * Math.cos(waveK() * x + WAVE.PHASE)) * (180 / Math.PI) * WAVE.BANK;
const CARD_SLOTS = [0.13, 0.32, 0.5, 0.68, 0.87];

gsap.utils.toArray('.card').forEach((card, i) => {
  const cw = card.offsetWidth,
    ch = card.offsetHeight;
  const slotCX = () => window.innerWidth * CARD_SLOTS[i];
  const s = { cx: window.innerWidth + cw };
  const place = () => {
    const x = s.cx;
    gsap.set(card, { x: x - cw / 2, y: waveY(x) - ch / 2, rotation: waveDeg(x) });
  };
  place();
  gsap.set(card, { autoAlpha: 0 });
  const START = 2.8 + i * 0.65;
  tl.to(s, { cx: slotCX(), ease: 'sine.out', duration: 2.0, onUpdate: place }, START);
  tl.to(card, { autoAlpha: 1, duration: 0.55, ease: 'sine.out' }, START);
});

/* =========================================================
    3) SKILLS — 폴더 스택
   ========================================================= */
const folders = gsap.utils.toArray('.folder');
if (folders.length) {
  const N = folders.length;
  const STRIP = 92; // 치워진 폴더가 왼쪽에 남기는 폭
  const ML = 60; // 왼쪽 기둥(.skills__label-pillar) 폭
  const MR = 60; // 오른쪽 탭(46px)이 잘리지 않게 남기는 여유

  // 폴더별 폭 — 오른쪽을 얼마나 덜 채울지(px)를 폴더마다 지정한다.
  // 0 이면 그 폴더가 최대 폭, 값이 클수록 그만큼 좁아진다.
  // 앞(0번)이 제일 작아야 하므로 값이 점점 작아지는 순서로 둔다.
  // 폭 자체가 아니라 여백으로 잡는 이유: 화면이 좁아져도, 왼쪽에 스트립이
  // 쌓여 남는 공간이 줄어도 계단 간격이 그대로 유지된다.
  const FOLDER_INSET = [630, 450, 270, 90];

  folders.forEach((f, i) => {
    gsap.set(f, { zIndex: 30 - i }); // 0번이 맨 위(= 가장 작음)
    f._content = f.querySelectorAll('.folder__head, .folder__list');
  });

  // k = 현재 맨 앞에 있는 폴더 index
  const layout = (k) => {
    const baseLeft = ML + k * STRIP; // 왼쪽에 쌓인 스트립들이 차지한 폭
    const maxW = window.innerWidth - baseLeft - MR; // 이 상태에서 쓸 수 있는 최대 폭
    return folders.map((_, j) => {
      if (j < k) return { left: ML + j * STRIP, width: STRIP }; // 왼쪽에 쌓임
      // j >= k : left 는 같고, FOLDER_INSET 만큼씩 덜 채워서 계단을 만든다
      const inset = FOLDER_INSET[j] ?? 0;
      return { left: baseLeft, width: Math.max(STRIP, maxW - inset) };
    });
  };

  const applyState = (k) => {
    const L = layout(k);
    folders.forEach((f, j) => {
      gsap.set(f, L[j]);
      gsap.set(f._content, { autoAlpha: j === k ? 1 : 0 });
    });
  };
  applyState(0);

  const skillsTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.skills',
      start: 'top top',
      end: '+=' + N * 640,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  for (let k = 1; k < N; k++) {
    const L = layout(k);
    folders.forEach((f, j) => {
      skillsTL.to(
        f,
        { left: L[j].left, width: L[j].width, ease: 'power2.inOut', duration: 1 },
        k - 1
      );
      skillsTL.to(
        f._content,
        { autoAlpha: j === k ? 1 : 0, duration: 0.5, ease: 'power1.inOut' },
        k - 1 + (j === k ? 0.4 : 0)
      );
    });
  }
}

/* 카드 클릭 → 상세/팝업 (여기에 라우팅 또는 모달 연결) */
gsap.utils.toArray('.card').forEach((card, i) => {
  card.addEventListener('click', () => {
    // TODO: 실제 상세 페이지 이동 또는 모달 오픈
    // 예) location.href = `/project/${i + 1}`;
    console.log('open project', i + 1);
  });
});
