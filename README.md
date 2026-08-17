# AN JIYOON — Publisher Portfolio

Vite + SCSS(BEM) 기반 포트폴리오. 인터랙션은 GSAP(ScrollTrigger).

## 실행

```bash
npm install
npm run dev       # 개발 서버 (HMR)
npm run build     # dist/ 로 빌드
npm run preview   # 빌드 결과 미리보기
```

## 폴더 구조

```
├─ index.html                 # 마크업 (BEM)
├─ public/
│  ├─ images/                 # 정적 이미지 (projectbackground.jpg 등)
│  └─ fonts/                  # 달무리 · Gmarket woff2 (README.txt 참고)
└─ src/
   ├─ main.js                 # 진입점 (scss + js import)
   ├─ js/
   │  └─ animations.js        # GSAP 인터랙션 (hero / projects / skills)
   └─ styles/
      ├─ main.scss            # @use 진입점
      ├─ abstracts/
      │  ├─ _tokens.scss      # ★ 색상 · 폰트 공통 토큰 (여기만 고치면 전역 반영)
      │  ├─ _functions.scss   # color('primary') 등
      │  └─ _mixins.scss      # type-hero / type-heading … 폰트 역할 믹스인
      ├─ base/
      │  ├─ _fonts.scss       # @font-face (로컬)
      │  ├─ _reset.scss
      │  └─ _base.scss
      ├─ layout/
      │  └─ _nav.scss
      └─ components/
         ├─ _window.scss  _hero.scss  _tv.scss  _reveal.scss
         ├─ _smile.scss   _projects.scss  _card.scss
         └─ _skills.scss  _folder.scss
```

## 공통 관리 (토큰)

`src/styles/abstracts/_tokens.scss` 에서 색상·폰트를 한 곳에서 관리합니다.

- 색상: `$color-primary`(#1C28D7), `$color-text`(#333) — 추가 색은 여기에.
- 폰트: `$font-dalmoori`, `$font-gmarket` + 사이즈 토큰(`$fs-hero`=120 …).
- 폰트 역할 믹스인(`_mixins.scss`): `type-hero`(달무리 120), `type-display`(달무리 40),
  `type-heading`(Gmarket bold 40), `type-title`(Gmarket medium 30), `type-body`(Gmarket light 24).

## 네이밍 규칙 (BEM)

`block__element--modifier` — 예) `.folder`, `.folder__tab`, `.folder__tab--blue`.
주요 블록: `nav · hero · tv · reveal · smile · projects · card · window · skills · folder`.

## 폰트 넣기

`src/assets/fonts/README.txt` 참고 — 눈누에서 달무리 / Gmarket Sans 를 받아 넣으면 됩니다.

## 남은 TODO
- Projects 카드 클릭 → 상세/모달 (`animations.js` 하단 클릭 핸들러에 연결)
- DESIGN / COLLABORATION 스킬 목록 실제 값으로 교체 (`index.html`)
- 실제 TV 프레임 · 스마일 · 카드 썸네일 에셋 교체
```
