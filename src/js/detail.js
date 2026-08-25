import '../styles/main.scss';
import gsap from 'gsap';

const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* =========================================================
    0) 무대 스케일 — 시안(1920×900)을 화면에 맞춰 통째로 축소
       CSS 의 --stage-scale 로 전달한다.
   ========================================================= */
const STAGE_W = 1920; // 시안 가로
const STAGE_H = 900; // 시안 세로
const MAX_SCALE = 1; // 시안보다 크게는 키우지 않는다 (1920 이상 화면 = 시안 px 그대로)

function fitStage() {
  if (window.matchMedia('(max-width: 767px)').matches) return; // 모바일은 스택 레이아웃
  const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H, MAX_SCALE);
  document.documentElement.style.setProperty('--stage-scale', s);
}
fitStage();
window.addEventListener('resize', fitStage);

/* =========================================================
    1) 페이지 진입 시 순서대로 떠오름 (스크롤과 무관, 1회 재생)
       1 제목 → 2 프로젝트 이미지 → 3 사이트로 이동
       → 4 스킬 → 5 주요 업무
       data-reveal="1..5" 순서를 그대로 따른다.
   ========================================================= */
const items = gsap.utils
  .toArray('[data-reveal]')
  .sort((a, b) => Number(a.dataset.reveal) - Number(b.dataset.reveal));

if (items.length) {
  const DELAY = 0.3; // 진입 후 첫 요소가 뜨기까지의 여유(초)
  const GAP = 0.28; // 요소와 요소 사이 간격(초)
  const DUR = 0.75; // 한 요소가 떠오르는 시간(초)

  gsap.set(items, { autoAlpha: 0, y: reduceMotion ? 20 : 70 });

  gsap.to(items, {
    autoAlpha: 1,
    y: 0,
    duration: DUR,
    ease: 'power3.out',
    delay: DELAY,
    stagger: GAP,
  });
}
