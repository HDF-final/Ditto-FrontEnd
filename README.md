# DITTO FrontEnd

중국·일본·미국 관광객이 국가별 K-컬처 트렌드를 탐색하고, AI로 맞춤 코스를 만든 뒤 코스 커스텀·모바일 실내 길찾기·여행자 커뮤니티로 경험을 이어가는 관광 플랫폼 DITTO의 프론트엔드입니다.

현재 문서는 **프론트엔드 초기 개발 환경 안내서**입니다. 화면과 기능이 완성되면 최종 서비스 설명, 기능 목록, 아키텍처 및 배포 안내를 포함한 프로젝트 소개 문서로 교체합니다.

## 핵심 사용자 흐름

```text
국가별 트렌드 탐색
→ AI 맞춤 코스 생성
→ 사용자 코스 커스텀
→ 모바일 실내 길찾기
→ 여행자 커뮤니티 공유
```

현재 단계에서는 백엔드 연동보다 웹·반응형 모바일 화면의 구조와 공통 개발 기반을 먼저 구축합니다.

## 기술 스택

| 영역 | 기술 | 책임 |
| --- | --- | --- |
| Framework | Next.js App Router | 라우팅, 서버 렌더링, 빌드 |
| UI | React | 컴포넌트와 화면 상호작용 |
| Language | JavaScript | 애플리케이션 코드 |
| Styling | Tailwind CSS | 반응형 UI와 디자인 토큰 |
| HTTP | Axios | 브라우저 API 통신 공통 인스턴스 |
| Client state | Zustand | 여러 클라이언트 컴포넌트가 공유하는 상태 |
| Package manager | pnpm | 의존성 및 잠금 파일 관리 |

설치된 정확한 버전은 [package.json](./package.json)과 `pnpm-lock.yaml`을 기준으로 합니다.

## 🦴 Commit Convention
### 커밋 메시지 규칙
커밋 메시지는 아래 형식으로 작성합니다:
```
<타입>:<내용>

ex) feat: 로그인 기능 추가
```
<br>

| 타입         | 설명                     |
| ---------- | ---------------------- |
| `feat`     | 새로운 기능 추가              |
| `fix`      | 버그 수정                  |
| `docs`     | 문서 수정 (README 등)       |
| `style`    | 코드 포맷팅, 세미콜론 누락 등      |
| `refactor` | 코드 리팩토링 (기능 변화 없음)     |
| `test`     | 테스트 코드 추가 또는 수정        |
| `chore`    | 기타 변경사항 (빌드 설정, 패키지 등) |

## 🌙 Git Flow 브랜치 전략
### 주요 브랜치
| 브랜치 이름      | 용도                                     |
| ----------- | -------------------------------------- |
| `main`      | 배포(Release)가 이루어지는 안정적인 코드             |
| `dev`   | 다음 릴리스를 준비하는 개발 브랜치                    |

---
### 브랜치 네이밍
브랜치 네이밍은 아래 형식으로 작성합니다:
```
<타입>/<이슈번호>

ex)feat/#23
```
| 타입         | 설명                |
| ---------- | ----------------- |
| `feat`  | 새로운 기능 작업         |
| `fix`      | 버그 수정 작업          |
| `hotfix`   | 급한 수정 작업 (배포 후 등) |
| `refactor` | 코드 리팩토링           |
| `docs`     | 문서 작업             |
| `chore`    | 기타 작업 (설정, 패키지 등) |

### ☸️ Git 브랜치 및 개발 프로세스

1. **기능 개발 시작**
    - `dev` 브랜치에서 새로운 `feat` 브랜치를 생성하여 개발을 시작합니다.

2. **기능 개발 및 커밋**
    - `feat` 브랜치에서 기능을 완성하고 커밋을 진행합니다.

3. **코드 리뷰 및 병합**
    - 개발 완료 후, `feat` 브랜치에서 `dev` 브랜치로 PR(Pull Request)을 생성하여 코드 리뷰를 받습니다.
    - 리뷰가 완료되면 `dev` 브랜치에 병합합니다.

4. **테스트**
    - `dev` 브랜치에서 배포 전 최종 기능들이 안정적으로 동작하는지 테스트합니다.

5. **배포**
    - 테스트가 완료되면 `dev` 브랜치를 `main` 브랜치에 병합하여 최종 배포를 진행합니다.

## 시작하기

### 요구 환경

- Node.js 20.9 이상을 만족하는 LTS 버전 권장
- pnpm 9.12.3

### 설치 및 실행

```bash
git clone https://github.com/HDF-final/Ditto-FrontEnd.git
cd Ditto-FrontEnd
pnpm install
cp .env.example .env.local
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 3000번 포트 실행과 종료

개발 서버 실행:

```bash
pnpm dev
```

서버가 실행 중인 터미널에서 `Ctrl+C`를 누르면 정상 종료됩니다.

터미널을 닫았는데 프로세스가 남아 있다면 먼저 PID를 확인합니다.

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

표시된 PID만 종료합니다.

```bash
kill <PID>
```

3000번 포트를 다른 프로세스가 사용 중일 때 임시로 다른 포트를 사용하려면:

```bash
pnpm exec next dev --port 3001
```

## 라우팅

Next.js App Router는 `src/app` 아래의 폴더를 URL 경로로 사용하고, 폴더 안의 `page.js`가 실제 페이지를 노출합니다.

| URL | 파일 | 용도 |
| --- | --- | --- |
| `/` | `src/app/page.js` | 홈 |
| `/login` | `src/app/login/page.js` | 로그인 (UI 검증만, 성공 시 `/`로 이동) |
| `/signup` | `src/app/signup/page.js` | 회원가입 (UI 검증만, 성공 시 `/country`로 이동) |
| `/country` | `src/app/country/page.js` | 국가·언어 선택 (성공 시 `/persona?lang=…`) |
| `/persona` | `src/app/persona/page.js` | 쇼핑 타입(페르소나) 선택 (성공 시 `/`로 이동) |
| `/ai-course` | `src/app/ai-course/page.js` | AI 코스 만들기 |
| `/courses` | `src/app/courses/page.js` | 코스 리스트 |
| `/community` | `src/app/community/page.js` | 여행자 커뮤니티 |
| `/news` | `src/app/news/page.js` | 뉴스피드 목록 |
| `/news/[slug]` | `src/app/news/[slug]/page.js` | 뉴스피드 상세 (슬러그 조회) |
| `/mypage` | `src/app/mypage/page.js` | 마이페이지 |

예를 들어 `/about` 페이지를 추가하려면 다음 파일을 만듭니다.

```text
src/app/about/page.js
```

`page.js`와 `layout.js`는 기본적으로 Server Component입니다. 상태, 이벤트, 브라우저 API 또는 Zustand가 필요한 작은 컴포넌트에만 파일 상단에 `"use client"`를 선언합니다.

## 프로젝트 구조

```text
Ditto-FrontEnd/
├── public/                    # 이미지, 아이콘 등 정적 파일
├── src/
│   ├── app/                   # App Router 페이지와 레이아웃
│   │   ├── page.js            # 홈
│   │   ├── ai-course/page.js  # AI 코스 만들기
│   │   ├── news/page.js       # 뉴스피드
│   │   ├── mypage/page.js     # 마이페이지
│   │   ├── login/page.js      # 로그인
│   │   ├── signup/page.js     # 회원가입
│   │   ├── country/page.js    # 국가·언어 선택
│   │   ├── persona/page.js    # 쇼핑 타입(페르소나) 선택
│   │   ├── layout.js          # 전역 HTML 레이아웃
│   │   └── globals.css        # 전역 스타일과 Tailwind 토큰
│   ├── components/
│   │   ├── home/              # 홈 화면 전용 섹션과 UI
│   │   ├── ai-course/         # AI 코스 생성·편집 화면 전용 UI
│   │   ├── news/              # 뉴스피드 화면 전용 UI
│   │   ├── mypage/            # 마이페이지 화면 전용 UI
│   │   ├── auth/              # 로그인·가입·국가·페르소나 온보딩 UI
│   │   ├── common/            # 도메인에 묶이지 않는 재사용 UI
│   │   └── layout/            # 전역 레이아웃을 구성하는 UI
│   ├── lib/
│   │   ├── api/               # Axios 공통 설정
│   │   ├── fixtures/          # 화면 개발용 정적 더미 데이터
│   │   └── utils/             # 순수 함수와 범용 유틸리티
│   └── stores/                # Zustand 전역 클라이언트 상태
├── .env.example               # 공개 가능한 환경변수 예시
├── AGENTS.md                  # 에이전트 작업 규칙
├── eslint.config.mjs
├── next.config.mjs
└── package.json
```

`components/common`에는 버튼, 선택기, 빈 상태처럼 여러 도메인에서 공유하는 UI를 둡니다. `components/layout`에는 헤더, 푸터, 내비게이션처럼 페이지 골격을 만드는 UI를 둡니다. 특정 페이지나 도메인에서만 쓰는 컴포넌트는 `components/home`, `components/ai-course`, `components/news`, `components/mypage`, `components/auth` 아래에 먼저 배치합니다.

`lib/fixtures`는 API 연동 전 화면을 구성하기 위한 정적 샘플 데이터만 관리합니다. 국가 목록은 `lib/fixtures/countries.js`, 쇼핑 타입은 `lib/fixtures/personas.js`를 단일 소스로 씁니다. `lib/utils`는 날짜 포맷터, 문자열 변환, 값 검증처럼 React와 브라우저 상태에 의존하지 않는 순수 유틸리티를 관리합니다. API endpoint는 `lib/api`에서 백엔드 계약이 확정된 뒤 추가합니다.

코스 편집처럼 여러 Client Component가 공유하는 다단계 작성 상태는 `src/stores/use-course-editor-store.js`에 둡니다. 국가·언어는 `src/stores/use-preference-store.js`에서 서로 독립적으로 관리합니다. 비로그인 사용자의 `countryCode`, `languageCode`만 localStorage에 보존하며, 로그인 사용자는 `GET /users/me`로 받은 DB 설정이 우선합니다. 인증 정보와 세션 값은 브라우저 저장소에 넣지 않습니다. 한 화면 내부에서만 필요한 상태는 전역 store로 올리지 않고 해당 컴포넌트의 React state로 관리합니다.

인증·온보딩 이동 정책:

```text
/signup → /country → /persona?lang=… → /
/login → /
```

## Axios 사용법

브라우저 API 통신은 [공통 Axios 인스턴스](./src/lib/api/client.js)를 사용합니다.

```js
import { apiClient } from "@/lib/api/client";

const { data } = await apiClient.get("/courses");
```

- `axios.create()`를 기능 파일마다 새로 만들지 않습니다.
- API 기준 주소는 `NEXT_PUBLIC_API_BASE_URL`로 관리합니다.
- 파일 업로드를 위해 `Content-Type`을 전역으로 고정하지 않습니다.
- 인증 방식이 확정되면 공통 인터셉터도 같은 파일에서 관리합니다.
- 현재 인스턴스는 브라우저 통신용입니다. Server Component의 서버 통신은 백엔드 구조 확정 후 별도 서버 모듈로 분리합니다.

### 백엔드 프록시

브라우저는 항상 같은 오리진의 `/api/*`로 요청하고, `next.config.mjs`의 rewrite가 백엔드로 넘깁니다. CORS 설정 없이 개발할 수 있고, 세션 쿠키(`JSESSIONID`)도 같은 오리진으로 오갑니다.

```text
브라우저  /api/v1/...  →  Next rewrite  →  ${API_PROXY_TARGET}/api/v1/...
```

백엔드 주소가 다르면 `.env.local`의 `API_PROXY_TARGET`만 바꿉니다. `NEXT_PUBLIC_` 접두사가 없으므로 브라우저 번들에 노출되지 않습니다.

> **⚠️ rewrite 프록시 기본 타임아웃은 30초입니다**
>
> 30초를 넘기는 API는 프록시가 먼저 소켓을 닫아버립니다. 그러면 백엔드에는 `Broken pipe`(ClientAbortException)가 찍히고, 브라우저는 Spring이 준 적 없는 `Internal Server Error` 문자열을 받습니다. 응답 봉투(`{"success":false,...}`) 형태가 아니면 이 경우를 의심하세요.
>
> AI 코스 추천이 40~50초 걸리므로 `next.config.mjs`에서 `experimental.proxyTimeout`을 150초로 늘려두었습니다. 클라이언트(axios) 타임아웃 120초보다 길게 잡아, 시간 초과 판단은 항상 axios가 먼저 하고 화면에 우리가 만든 안내가 뜨도록 했습니다.
>
> 타임아웃 계층은 세 곳입니다 — **axios 120초 < 프록시 150초**, 그리고 백엔드. 새 장기 API를 붙일 때 이 순서를 유지하세요.

### AI 코스 추천 (`lib/api/ai-course.js`)

`POST /api/v1/ai/course-recommendations/chat` 하나로 **생성·다듬기·재추천**을 모두 처리합니다.

| 하고 싶은 것 | 보내는 값 |
| --- | --- |
| 맞춤 코스 생성 (첫 요청) | `sessionId` 없이 `message`만 |
| 대화로 다듬기 / 재추천 | 직전 응답의 `sessionId` + `message` |

- `sessionId`는 **서버가 발급**합니다. 클라이언트가 만들지 않습니다.
- 한 턴에 40초 안팎 걸리므로 이 요청만 타임아웃을 120초로 넓혀 보냅니다(공통 인스턴스 기본값은 15초).
- 응답의 `places[].navigationKey`를 `lib/navigation/course-routing-service.js`의 `resolveCoursePlace()`로 실내 지도 장소에 매핑합니다. 매칭되지 않는 키는 길찾기가 불가능하므로 코스에서 제외합니다.
- 로그인 세션이 필요한 엔드포인트입니다. 미인증 상태에서는 403이 오고 화면에 로그인 안내가 표시됩니다.

### 뉴스피드 (`lib/api/news.js`, `lib/api/news.server.js`)

K-컬처 트렌드 뉴스피드 조회 API 엔드포인트:

| 용도 | 메서드 | 엔드포인트 | 클라이언트 함수 | 서버 함수 |
| --- | --- | --- | --- | --- |
| 뉴스피드 목록 조회 | `GET` | `/api/v1/news?page={page}&size={size}` | `getNewsFeeds()` | `fetchNewsFeedsServer()` |
| 뉴스피드 상세 조회 | `GET` | `/api/v1/news/{newsId}` | `getNewsFeedById(id)` | `getNewsDetailById(id)` |
| 검색 유입 슬러그 조회 | `GET` | `/api/v1/news/slug/{slug}` | `getNewsFeedBySlug(slug)` | `getNewsDetailBySlug(slug)` |
| 사이트맵 목록 조회 | `GET` | `/api/v1/news/sitemap` | `getNewsFeedsForSitemap()` | `getNewsSitemap()` |

- **서버 컴포넌트(`src/app/news/page.js`, `src/app/news/[slug]/page.js`, `src/app/sitemap.js`)**: `lib/api/news.server.js`를 통해 SSR/SSG 및 백엔드 미가동 시 안전한 폴백(fixtures) 처리를 지원합니다.
- **클라이언트 컴포넌트**: `lib/api/news.js`를 통해 브라우저 공통 Axios 인스턴스로 API 통신을 수행합니다.

## Zustand 사용법

Zustand는 국가·언어, 다단계 코스 작성 상태, 전역 모달처럼 여러 Client Component가 공유해야 하는 상태에만 사용합니다.

```js
"use client";

import { usePreferenceStore } from "@/stores/use-preference-store";

const countryCode = usePreferenceStore((state) => state.countryCode);
const languageCode = usePreferenceStore((state) => state.languageCode);
```

- 한 컴포넌트에서만 사용하는 값은 React `useState`를 사용합니다.
- API 응답 목록 전체를 Zustand에 불필요하게 복사하지 않습니다.
- 인증 토큰을 Zustand persist나 `localStorage`에 저장하지 않습니다.
- 국가·언어 저장소는 `skipHydration` 후 클라이언트에서 복원하며, 로그인된 경우 DB 값으로 덮어씁니다.
- `/country`에서 국가는 콘텐츠·트렌드 시장, 언어는 화면 표시 언어로 별도 선택합니다.

### 국가·언어 설정 1차 범위

- 지원 국가: `KR`, `CN`, `JP`, `US`
- 지원 언어: `ko`, `zh`, `ja`, `en`
- 저장 API: `PATCH /api/v1/users/me/preferences`
- 세션 복원: `GET /api/v1/users/me`
- 게스트 저장: `ditto-preferences-v1` localStorage (국가·언어만 저장)

이번 1차에는 설정 저장과 선택 UI까지만 포함합니다. 화면 고정 문구 사전, 실제 UI 언어 전환,
동적 콘텐츠 번역 및 DeepL 연동은 후속 단계입니다.

## Tailwind CSS

Tailwind CSS 4를 사용하며 전역 디자인 토큰은 `src/app/globals.css`의 `@theme`에서 관리합니다.

- 컴포넌트 스타일은 Tailwind 유틸리티 클래스를 우선합니다.
- 반복되는 색상·간격·폰트 값은 디자인 토큰으로 승격합니다.
- 임의의 전역 CSS는 브라우저 기본값이나 공통 토큰처럼 범위가 명확할 때만 추가합니다.

## 환경변수

`.env.example`은 키 이름과 안전한 예시만 포함해 Git에 커밋합니다. 실제 값은 Git에서 제외되는 `.env.local`에 작성합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=/api/v1
NEXT_PUBLIC_LOCAL_USER_ID=1
API_PROXY_TARGET=http://localhost:8080
```

| 키 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 브라우저가 호출할 API 기준 경로. 기본값 `/api/v1`. |
| `NEXT_PUBLIC_LOCAL_USER_ID` | 로컬 인증 대체용 `X-User-Id`. 운영 빌드에서는 사용하지 않습니다. |
| `API_PROXY_TARGET` | Next가 `/api/*`를 넘길 백엔드 주소. 기본값 `http://localhost:8080`. |

`NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저 번들에 포함되므로 비밀 키를 넣으면 안 됩니다.
개발 환경에서는 `NEXT_PUBLIC_LOCAL_USER_ID`를 `X-User-Id` 헤더로 전달하며, 운영 인증이 연결되면 제거합니다.
브라우저의 `/api/*` 요청은 Next.js rewrite를 통해 `API_PROXY_TARGET`으로 전달합니다.

## 라이브러리 관리

이 프로젝트는 pnpm만 사용합니다. `package-lock.json`이나 `yarn.lock`을 만들지 않습니다.

```bash
# 프로덕션 의존성 추가
pnpm add <package>

# 개발 도구 추가
pnpm add -D <package>

# 제거
pnpm remove <package>

# 오래된 패키지 확인
pnpm outdated

# 설치 상태 재현
pnpm install --frozen-lockfile
```

`package.json`과 `pnpm-lock.yaml`은 함께 커밋하고 잠금 파일을 직접 수정하지 않습니다. 주요 버전 업그레이드는 변경 사항을 확인한 뒤 별도 작업으로 진행합니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 3000번 포트에서 개발 서버 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드 결과를 3000번 포트에서 실행 |
| `pnpm check` | lint 후 build 연속 검증 |

## PWA 계획

초기에는 반응형 웹을 완성합니다. 이후 동일한 App Router 구조를 유지하면서 manifest, 앱 아이콘, 서비스 워커, 설치 및 오프라인 정책을 추가해 PWA로 확장합니다.
