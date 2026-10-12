# Doodle

기록 도구, 실험용 컴포넌트, 게임 유틸을 모아둔 개인 작업 공간.

- 사이트: [doodle-teal-three.vercel.app](https://doodle-teal-three.vercel.app)

## 페이지

### 기록 · 실험

| 페이지 | 경로 | 설명 |
| --- | --- | --- |
| ⏰ 초과근로 기록 | [`/overtime`](https://doodle-teal-three.vercel.app/overtime) | 달력에 초과근로를 기록하고 월별 수당·보상휴가·실수령액을 계산 |
| 🎬 Motion 실험 | [`/motion`](https://doodle-teal-three.vercel.app/motion) | framer-motion 예제 모음 |

### 게임 유틸 (`/private/*`)

| 페이지 | 경로 |
| --- | --- |
| ⚡ 심볼 계산기 | [`/private/symbol`](https://doodle-teal-three.vercel.app/private/symbol) |
| 🧮 MVP 회수율 계산기 | [`/private/mvp`](https://doodle-teal-three.vercel.app/private/mvp) |

홈·메뉴에서 숨긴 페이지(`hidden: true`): 경험치 쿠폰 계산기, 이벤트 캘린더, 메이플 캘린더, 메포 차트, Event 2412/2408. 주소로 직접 들어가면 열린다.

예전 주소(`/symbol`, `/mvp` 등)는 `next.config.js`의 리다이렉트로 `/private/*`로 넘어간다.

## 개발

```sh
yarn install
yarn dev      # http://localhost:3030
yarn build
```

Next.js 14 (App Router) · TypeScript · Tailwind CSS · framer-motion · zustand · dayjs

## 배포

Vercel이 `master` 푸시마다 자동으로 프로덕션 배포한다. 별도 배포 명령은 없다.

## 구조

```
app/                  라우트 (게임 유틸은 app/private/ 아래)
src/config/site.ts    페이지 레지스트리 — 홈 탭과 상단 메뉴가 이 목록만 본다
src/features/<이름>/  페이지별 기능 코드
src/styles/index.css  디자인 토큰 (CSS 변수, tailwind.config.js 에서 매핑)
```

새 페이지 추가: `app/` 아래 라우트를 만들고 `src/config/site.ts`의 알맞은 그룹(`personal` / `game`)에 등록한다.

## 초과근로 기록 메모

- 기록·설정은 브라우저 localStorage에만 저장된다(서버 없음). 기기 간 이동은 내보내기/가져오기(링크 또는 JSON 파일)로 한다.
- 링크는 데이터를 압축해 URL `#` 뒤에 담는다. 암호화가 아니므로 연봉을 포함해 내보낸 링크는 공유에 주의.
- 소득세는 `src/features/overtime/incomeTaxTable.ts`(근로소득 간이세액표, 2026.2.27 개정)를 그대로 쓴다. 세법·4대보험 요율이 바뀌면 이 파일과 `payroll.ts`의 `RATES`를 갱신한다.
