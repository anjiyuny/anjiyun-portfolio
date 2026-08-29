import '../styles/main.scss';
import gsap from 'gsap';

const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

const STAGE_W = 1920;
const STAGE_H = 900;
const MAX_SCALE = 2;

function fitStage() {
  if (window.matchMedia('(max-width: 767px)').matches) return;
  const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H, MAX_SCALE);
  document.documentElement.style.setProperty('--stage-scale', s);
}
fitStage();
window.addEventListener('resize', fitStage);

const items = gsap.utils
  .toArray('[data-reveal]')
  .sort((a, b) => Number(a.dataset.reveal) - Number(b.dataset.reveal));

if (items.length) {
  const DELAY = 0.3;
  const GAP = 0.28;
  const DUR = 0.75;

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
