import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const floatScale = reduceMotion ? 0.4 : 1;

/* =========================================================
    해상도 대응
   ========================================================= */
const STAGE_W = 1920;
const STAGE_H = 900;
const MAX_SCALE = 2;

let stageScale = 1;
const stageH = () => window.innerHeight / stageScale;
const stageVW = () => window.innerWidth / stageScale;

function fitStage() {
  stageScale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H, MAX_SCALE);
  document.documentElement.style.setProperty('--stage-scale', stageScale);
}
fitStage();
window.addEventListener('resize', () => {
  fitStage();
  ScrollTrigger.refresh();
});

/* =========================================================
    1) 마우스 두둥실 (TV + 스마일)
   ========================================================= */
const tvEl = document.querySelector('.tv');
const smileEl = document.querySelector('.smile');
let pMouseX = 0,
  pMouseY = 0,
  curX = 0,
  curY = 0;
let floatAmount = 1;

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
    2) HERO 에서 PROJECTS
   ========================================================= */
gsap.set('.smile__icon', { xPercent: -50, yPercent: -50 });
gsap.set('.projects__title', { xPercent: -50, yPercent: -50, visibility: 'visible', autoAlpha: 0 });

const PROJECTS_END_Y = () => -(stageH() / 2 - 118);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '+=7600',
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      floatAmount = 1 - Math.min(self.progress / 0.15, 1);
    },
  },
});

/* Phase A. TV 수평 정렬 */
tl.to('.tv__body', { rotation: 0, ease: 'power2.out', duration: 1 }, 0);
tl.to('.hero__scroll', { autoAlpha: 0, duration: 0.3 }, 0);

/* Phase B. 원이 화면 전체 배경으로  */
gsap.set('.reveal', { width: 140, height: 140, borderRadius: 9999, autoAlpha: 0 });
tl.set('.reveal', { autoAlpha: 1 }, 1.1);
tl.to('.smile__glow', { autoAlpha: 0, duration: 0.4 }, 1.1);
tl.to('.reveal', { width: 460, height: 460, ease: 'power1.inOut', duration: 0.6 }, 1.1); // 원 성장
tl.to(
  '.reveal',
  {
    width: () => stageVW(),
    height: () => stageH(),
    ease: 'power2.inOut',
    duration: 0.85,
  },
  1.7
);
tl.to('.reveal', { borderRadius: 40, ease: 'power2.out', duration: 0.45 }, 1.7); // 모서리 둥글게
tl.to('.reveal', { borderRadius: 0, ease: 'power2.in', duration: 0.35 }, 2.2); // 모서리 각지게
tl.to('.hero__title, .hero__desc, .hero__grid', { autoAlpha: 0, duration: 0.5 }, 1.0);
tl.to('.tv__frame, .tv__screen', { autoAlpha: 0, duration: 0.6 }, 1.2);

/* Phase C. 타이틀은 상단 고정, 스마일은 위로 빠짐 */
tl.fromTo(
  '.projects__title',
  { y: () => stageH() * 0.6, autoAlpha: 0 },
  { y: PROJECTS_END_Y, autoAlpha: 1, ease: 'power2.out', duration: 0.9 },
  1.75
);
tl.to('.smile__icon', { y: () => -stageH() * 0.62, ease: 'power2.in', duration: 0.9 }, 1.75);
tl.to('.smile__icon', { autoAlpha: 0, duration: 0.25 }, 2.4);

/* 카드 뒤 스파클 커짐 */
const SPARKLE_START = 2.55;
const SPARKLE_GAP = 1;
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

/* Phase D. 카드 오른쪽에서 왼쪽으로 이동 */
const WAVE = { A: 78, WAVELEN: 0.52, PHASE: 0.7, MIDY: 0.52, BANK: 0.4 };
const waveK = () => (2 * Math.PI) / (stageVW() * WAVE.WAVELEN);
const waveY = (x) => stageH() * WAVE.MIDY + WAVE.A * Math.sin(waveK() * x + WAVE.PHASE);
const waveDeg = (x) =>
  Math.atan(WAVE.A * waveK() * Math.cos(waveK() * x + WAVE.PHASE)) * (180 / Math.PI) * WAVE.BANK;

const CARD_SLOTS = [0.107, 0.301, 0.5, 0.701, 0.897];

const CARD_ADJUST = [
  { x: 0, y: 0, rot: 2 }, // 1번
  { x: 0, y: 0, rot: 0 }, // 2번
  { x: 0, y: 0, rot: 0 }, // 3번
  { x: 0, y: -120, rot: 6 }, // 4번
  { x: 0, y: 100, rot: 3 }, // 5번
];

gsap.utils.toArray('.card').forEach((card, i) => {
  const cw = card.offsetWidth,
    ch = card.offsetHeight;
  const adj = CARD_ADJUST[i] ?? { x: 0, y: 0, rot: 0 };
  const slotCX = () => stageVW() * CARD_SLOTS[i] + adj.x;
  const s = { cx: stageVW() + cw };
  const place = () => {
    const x = s.cx;
    gsap.set(card, {
      x: x - cw / 2,
      y: waveY(x) - ch / 2 + adj.y,
      rotation: waveDeg(x) + adj.rot,
    });
  };
  place();
  gsap.set(card, { autoAlpha: 0 });
  const START = 2.8 + i * 0.65;

  tl.to(s, { cx: () => slotCX(), ease: 'sine.out', duration: 2.0, onUpdate: place }, START);
  tl.to(card, { autoAlpha: 1, duration: 0.55, ease: 'sine.out' }, START);
});

/* =========================================================
    3) SKILLS 에서 CONTACT 
   ========================================================= */
const SEQ = {
  ROLE: { at: 0, dur: 0.55 },
  TYPE: { at: 0.6, stagger: 0.11 },
  SPARK: { at: 1.8, stagger: 0.28, dur: 0.8 },
  BOX: { at: 2.8, dur: 0.6 },
  LINE: { at: 3.4, stagger: 0.4, dur: 0.55 },
};

// 타임라인 총 길이
function measureContactSequence() {
  const nSpark = document.querySelectorAll('.contact__sparkle, .contact__smile').length;
  const nLine = document.querySelectorAll('.contact__msg, .contact__row').length;
  return Math.max(
    SEQ.SPARK.at + Math.max(0, nSpark - 1) * SEQ.SPARK.stagger + SEQ.SPARK.dur,
    SEQ.BOX.at + SEQ.BOX.dur,
    SEQ.LINE.at + Math.max(0, nLine - 1) * SEQ.LINE.stagger + SEQ.LINE.dur
  );
}

function addContactSequence(tl, at) {
  const section = document.querySelector('.contact');
  if (!section) return 0;

  // 텍스트 알파벳 단위 분할
  const nameEl = section.querySelector('.contact__name-text');
  if (nameEl && !nameEl.querySelector('.contact__char')) {
    nameEl.innerHTML = [...nameEl.textContent]
      .map((ch) => `<span class="contact__char">${ch === ' ' ? '&nbsp;' : ch}</span>`)
      .join('');
  }
  const chars = gsap.utils.toArray('.contact__char');
  const sparkles = gsap.utils.toArray('.contact__sparkle, .contact__smile');
  const lines = gsap.utils.toArray('.contact__msg, .contact__row');
  const ease = reduceMotion ? 'power2.out' : 'back.out(1.5)';

  // Web Publisher - 아래에서 위로
  tl.from(
    '.contact__role',
    { y: 28, autoAlpha: 0, duration: SEQ.ROLE.dur, ease: 'power2.out' },
    at + SEQ.ROLE.at
  );

  // 이름 한 글자씩
  gsap.set(chars, { autoAlpha: 0 });
  tl.to(
    chars,
    { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: SEQ.TYPE.stagger },
    at + SEQ.TYPE.at
  );

  // 커서 깜빡임 시작
  const typeEnd = SEQ.TYPE.at + chars.length * SEQ.TYPE.stagger;
  tl.set('.contact__caret', { visibility: 'visible' }, at + typeEnd);

  // 스파클
  tl.fromTo(
    sparkles,
    { autoAlpha: 0, scale: reduceMotion ? 0.9 : 0.35, rotation: reduceMotion ? 0 : -12 },
    {
      autoAlpha: 1,
      scale: 1,
      rotation: 0,
      duration: SEQ.SPARK.dur,
      ease,
      stagger: SEQ.SPARK.stagger,
      transformOrigin: '50% 50%',
    },
    at + SEQ.SPARK.at
  );

  // 창(박스)
  tl.fromTo(
    '.contact__box',
    { autoAlpha: 0, scaleY: 0.9, transformOrigin: '50% 0%' },
    { autoAlpha: 1, scaleY: 1, duration: SEQ.BOX.dur, ease: 'power2.out' },
    at + SEQ.BOX.at
  );

  // 문장 한 줄씩 아래에서 위로
  tl.from(
    lines,
    { y: 24, autoAlpha: 0, duration: SEQ.LINE.dur, ease: 'power2.out', stagger: SEQ.LINE.stagger },
    at + SEQ.LINE.at
  );

  // 시퀀스 전체 길이를 돌려준다
  return Math.max(
    SEQ.SPARK.at + (sparkles.length - 1) * SEQ.SPARK.stagger + SEQ.SPARK.dur,
    SEQ.BOX.at + SEQ.BOX.dur,
    SEQ.LINE.at + (lines.length - 1) * SEQ.LINE.stagger + SEQ.LINE.dur
  );
}

let skillsST = null; // 네비에서 contact 위치를 계산할 때 사용

const folders = gsap.utils.toArray('.folder');
if (folders.length) {
  const N = folders.length;
  gsap.set('.contact', { xPercent: 100 });

  const ML = 60; // 왼쪽 기둥(.skills__label-pillar) 폭
  const PEEK = 100; // 쌓였을 때 속지가 보이는 폭
  const PAGE_R = 0; // 속지 오른쪽에 남는 폴더 여백
  const STRIP = PEEK + PAGE_R; // 폴더 몸통이 튀어나오는 폭

  // 탭 폭은 CSS 값을 그대로 읽는다
  const TABW = folders[0].querySelector('.folder__tab')?.offsetWidth || 60;

  // 왼쪽 더미가 시작되는 x.
  // 파란 라벨 귀가 기둥보다 넓어서, 기둥 폭에서 시작하면 속지가 귀 뒤로 가려진다.
  const EAR = document.querySelector('.skills__label-tag')?.offsetWidth || 0;
  const PILE_L = Math.max(ML, EAR);

  // 쌓인 폴더 한 장이 차지하는 총 폭 = 속지 + 색여백 + 탭.
  // 탭이 폴더 바깥으로 튀어나오므로 더해줘야 다음 폴더를 가리지 않는다.
  const PITCH = PEEK + PAGE_R + TABW;
  const MR = TABW + 24; // 맨 뒤 폴더 탭이 잘리지 않게 두는 오른쪽 여유

  // 폴더별 오른쪽 여백(px). 값이 클수록 폴더가 좁다.
  // 앞쪽이 가장 좁으므로 큰 값에서 작은 값 순서. (173이 탭 간격)
  const FOLDER_INSET = [519, 346, 173, 0];

  // 화면 폭이 아니라 STAGE_W 기준이므로 어느 해상도에서도 폴더 폭이 같다
  const widthOf = (j) => {
    const maxW = STAGE_W - ML - MR;
    return Math.max(STRIP, maxW - (FOLDER_INSET[j] ?? 0));
  };

  // 폴더 j 가 왼쪽에 쌓였을 때의 x 이동량.
  // j번째 자리는 PILE_L + PITCH*j 에서 시작하고, 몸통(STRIP) 만큼이 오른쪽 끝이다.
  const pileX = (j) => PILE_L + PITCH * j + STRIP - (ML + widthOf(j));

  // 초기 배치. left 는 모두 같고 width 만 뒤로 갈수록 커진다. 앞쪽이 위로 온다.
  const layout = () => {
    folders.forEach((f, j) => {
      gsap.set(f, { left: ML, width: widthOf(j), zIndex: N - j });
      gsap.set(f.querySelector('.folder__page'), {
        right: 40,
        paddingLeft: 170 + (PILE_L - ML) + j * PITCH,
      });
    });
  };
  layout();
  window.addEventListener('resize', layout);

  /* ========================================
                    스크롤 길이
  =========================================== */
  const STEP_PX = 1100; // 전체 속도
  const LEAD = 0.8; // 섹션에 들어온 뒤 쉬는 구간
  const GAP = 0.35; // 폴더와 폴더 사이 간격
  const WIPE_DUR = 1.6; // Contact 와이프 길이
  const SETTLE = 0.4; // 와이프 도착 후 시퀀스 시작까지 쉬는 구간

  // 폴더 j 가 시작하는 타임라인 위치
  const stepAt = (j) => LEAD + j * (1 + GAP);
  const WIPE_AT = stepAt(N - 1) + 1; // 와이프 시작 위치
  const SEQ_AT = WIPE_AT + WIPE_DUR + SETTLE; // Contact 시퀀스 시작 위치

  // 시퀀스 길이는 요소 개수에 따라 달라지므로 미리 계산
  const SEQ_DUR = measureContactSequence();
  const TOTAL_STEPS = Math.max(WIPE_AT + WIPE_DUR, SEQ_AT + SEQ_DUR) + 0.2;

  const skillsTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.skills-wrap', // .skills 가 아니라 wrap 을 pin 한다
      start: 'top top',
      end: '+=' + TOTAL_STEPS * STEP_PX,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  for (let j = 0; j < N; j++) {
    skillsTL.to(folders[j], { x: () => pileX(j), ease: 'power2.inOut', duration: 1 }, stepAt(j));
  }

  // 마지막 폴더가 멈춘 뒤 Contact 가 오른쪽에서 들어온다
  skillsTL.fromTo(
    '.contact',
    { xPercent: 100 },
    { xPercent: 0, ease: 'power2.inOut', duration: WIPE_DUR },
    WIPE_AT
  );

  // Contact 내부 시퀀스
  addContactSequence(skillsTL, SEQ_AT);

  skillsST = skillsTL.scrollTrigger;
}

/* =========================================================
    상세 페이지에서 돌아왔을 때 스크롤 위치 복원
   ========================================================= */
const SCROLL_KEY = 'portfolio:lastY';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// 상세로 나갈 때 현재 위치를 저장
document.querySelectorAll('.card__link').forEach((a) => {
  a.addEventListener('click', () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)));
});

window.addEventListener('load', () => {
  ScrollTrigger.refresh();

  const y = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
  if (!y) return;

  // 뒤로가기, 상세 페이지에서 넘어온 경우에만 복원
  const navType = performance.getEntriesByType('navigation')[0]?.type;
  const fromDetail =
    document.referrer && new URL(document.referrer, location.href).pathname.includes('/project/');
  if (navType !== 'back_forward' && !fromDetail) return;

  window.scrollTo(0, y);
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    window.scrollTo(0, y);
  });
});

/* =========================================================
    상단 네비
   ========================================================= */
const NAV_DUR = 1.2;

const NAV_TARGETS = {
  '#work': () => tl.scrollTrigger.end,
  '#contact': () => (skillsST ? skillsST.end : document.body.scrollHeight),
};

document.querySelectorAll('.nav a[href^="#"]').forEach((a) => {
  const getY = NAV_TARGETS[a.getAttribute('href')];
  if (!getY) return;

  a.addEventListener('click', (e) => {
    e.preventDefault();
    ScrollTrigger.refresh();
    gsap.to(window, {
      scrollTo: { y: getY(), autoKill: false },
      duration: NAV_DUR,
      ease: 'power2.inOut',
    });
  });
});
