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

/* 카드 뒤 스파클 — 01 → 02 → 03 순서로 튀어나오며 커짐 */
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
    3) SKILLS — 중첩(nested) 스택 + 좌측 슬라이드
    · 모든 폴더가 같은 left(ML) 에 겹쳐 있고, 뒤로 갈수록 width 가 크다
      → 앞 폴더가 뒤 폴더를 덮고, 오른쪽엔 탭만 계단처럼 노출
    · 스크롤 1스텝 = 맨 앞 폴더가 왼쪽으로 슬라이드해 나가 띠로 쌓임
      뒤 폴더는 '전혀 움직이지 않는다' → 원래 깔려 있던 게 그대로 드러남
   ========================================================= */
const folders = gsap.utils.toArray('.folder');
if (folders.length) {
  const N = folders.length;

  const ML = 60; // 왼쪽 기둥(.skills__label-pillar) 폭

  // ★★ 왼쪽에 쌓였을 때 보이는 구성 — 이 두 값으로 조절 ★★
  //   [ 속지(PEEK) | 폴더 색 여백(PAGE_R) | 탭(TABW) ]  ← 왼쪽부터 순서대로 보임
  const PEEK = 64; //  쌓였을 때 '속지(종이)'가 보이는 폭
  const PAGE_R = 40; //  속지 오른쪽에 남는 폴더 색 여백
  const STRIP = PEEK + PAGE_R; // 폴더 몸통이 튀어나오는 폭 (자동 계산)

  // 탭 폭은 CSS(.folder__tab width)에서 자동으로 읽음 → CSS만 바꿔도 계산이 맞음
  const TABW = folders[0].querySelector('.folder__tab')?.offsetWidth || 60;

  // 왼쪽 더미가 '시작되는 x'.
  //  ※ .skills__label-tag(파란 라벨 귀)가 기둥보다 넓어서, 기둥 폭(ML)에서 시작하면
  //    쌓인 폴더의 속지가 그 귀 뒤에 가려진다 → 귀 폭만큼 밀어서 시작.
  const EAR = document.querySelector('.skills__label-tag')?.offsetWidth || 0;
  const PILE_L = Math.max(ML, EAR);

  // 쌓인 폴더 1장이 실제로 차지하는 총 폭 = 속지 + 색여백 + 탭
  //  ※ 탭이 폴더 오른쪽 '바깥'으로 튀어나오므로 반드시 더해줘야
  //    다음 폴더의 속지를 가리지 않는다.
  const PITCH = PEEK + PAGE_R + TABW;
  const MR = TABW + 24; // 오른쪽 여유 (맨 뒤 폴더 탭이 잘리지 않게)

  // 폴더별 '오른쪽 여백(px)'. 값이 클수록 좁다.
  // 앞(0번)이 가장 좁아야 하므로 큰 값 → 작은 값 순서. 차이값(180)이 탭 계단 간격.
  const FOLDER_INSET = [540, 360, 180, 0];

  const widthOf = (j) => {
    const maxW = window.innerWidth - ML - MR;
    return Math.max(STRIP, maxW - (FOLDER_INSET[j] ?? 0));
  };

  // 폴더 j 가 왼쪽에 쌓였을 때의 x 이동량
  //   j번째 자리 시작 = PILE_L + PITCH*j,  그 자리에서 몸통(STRIP)만큼 뒤가 오른쪽 끝.
  //   → 각 폴더가 [속지 PEEK | 색 PAGE_R | 탭 TABW] 를 겹치지 않고 차지한다.
  const pileX = (j) => PILE_L + PITCH * j + STRIP - (ML + widthOf(j));

  // 초기 배치 — left 는 전부 동일, width 만 뒤로 갈수록 크게, 앞이 위(z 높음)
  const layout = () => {
    folders.forEach((f, j) => {
      gsap.set(f, { left: ML, width: widthOf(j), zIndex: N - j });
      gsap.set(f.querySelector('.folder__page'), {
        right: PAGE_R, // 속지 오른쪽 색 여백 (JS 가 단일 관리)
        // 왼쪽에 쌓인 띠 + 탭에 글자가 가리지 않도록 깊이만큼 왼쪽 여백 확보
        paddingLeft: 52 + (PILE_L - ML) + j * PITCH,
      });
    });
  };
  layout();
  window.addEventListener('resize', layout);

  const skillsTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.skills',
      start: 'top top',
      end: '+=' + N * 640,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // 스크롤 1스텝 = 맨 앞 폴더 1장이 왼쪽으로 슬라이드
  // (속지는 폴더와 함께 밀려나 .folder__clip 의 overflow 에 잘리고,
  //  오른쪽에 남겨둔 색 여백만 띠로 남는다 → opacity 조작 불필요)
  for (let j = 0; j < N - 1; j++) {
    skillsTL.to(folders[j], { x: () => pileX(j), ease: 'power2.inOut', duration: 1 }, j);
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
