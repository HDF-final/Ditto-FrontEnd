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

현재 단계는 **모바일 PWA 프론트엔드**입니다. 화면은 430px 앱 셸로 고정되고, 홈 화면 설치·standalone 표시를 지원합니다.

## 기술 스택

| 영역 | 기술 | 책임 |
| --- | --- | --- |
| Framework | Next.js App Router | 라우팅, 서버 렌더링, 빌드 |
| UI | React | 컴포넌트와 화면 상호작용 |
| Language | JavaScript | 애플리케이션 코드 |
| Styling | Tailwind CSS | 반응형 UI와 디자인 토큰 |
| HTTP | Axios | 브라우저 API 통신 공통 인스턴스 |
| Client state | Zustand | 여러 클라이언트 컴포넌트가 공유하는 상태 |
| Internationalization | next-intl | 서버 렌더링과 클라이언트 UI의 한·중·일·영 고정 문구 |
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
| `/scan-map` | `src/app/scan-map/page.js` | OCR 내 위치 3D 지도 |
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
│   │   ├── layout.js          # 전역 HTML 레이아웃·PWA viewport
│   │   ├── manifest.js        # 웹 앱 매니페스트
│   │   ├── icon.js            # PWA 아이콘
│   │   └── globals.css        # 전역 스타일과 Tailwind 토큰
│   ├── components/
│   │   ├── home/              # 홈 화면 전용 섹션과 UI
│   │   ├── ai-course/         # AI 코스 생성·편집 화면 전용 UI
│   │   ├── news/              # 뉴스피드 화면 전용 UI
│   │   ├── mypage/            # 마이페이지 화면 전용 UI
│   │   ├── auth/              # 로그인·가입·국가·페르소나 온보딩 UI
│   │   ├── common/            # 도메인에 묶이지 않는 재사용 UI
│   │   └── layout/            # 앱 셸, 헤더, 하단 탭, PWA 등록
│   ├── lib/
│   │   ├── api/               # Axios 공통 설정
│   │   ├── pwa/               # 앱 아이콘 렌더러
│   │   ├── fixtures/          # 화면 개발용 정적 더미 데이터
│   │   └── utils/             # 순수 함수와 범용 유틸리티
│   └── stores/                # Zustand 전역 클라이언트 상태
├── .env.example               # 공개 가능한 환경변수 예시
├── AGENTS.md                  # 에이전트 작업 규칙
├── eslint.config.mjs
├── next.config.mjs
└── package.json
```

`components/common`에는 버튼, 선택기, 빈 상태처럼 여러 도메인에서 공유하는 UI를 둡니다. `components/layout`에는 앱 셸, 헤더, 하단 탭처럼 페이지 골격을 만드는 UI를 둡니다. 특정 페이지나 도메인에서만 쓰는 컴포넌트는 `components/home`, `components/ai-course`, `components/news`, `components/mypage`, `components/auth` 아래에 먼저 배치합니다.

`lib/fixtures`는 API 연동 전 화면을 구성하기 위한 정적 샘플 데이터만 관리합니다. 국가 목록은 `lib/fixtures/countries.js`, 쇼핑 타입은 `lib/fixtures/personas.js`를 단일 소스로 씁니다. `lib/utils`는 날짜 포맷터, 문자열 변환, 값 검증처럼 React와 브라우저 상태에 의존하지 않는 순수 유틸리티를 관리합니다. API endpoint는 `lib/api`에서 백엔드 계약이 확정된 뒤 추가합니다.

코스 편집처럼 여러 Client Component가 공유하는 다단계 작성 상태는 `src/stores/use-course-editor-store.js`에 둡니다. 하단 `+` 카메라로 로고를 OCR 스캔하면 `POST /api/v1/ocr/locations/recognize`로 간판 이미지를 보내고, `/scan-map`에서 **전체층** 3D 지도에 작은 지도 핀으로 내 위치를 표시합니다. **AI 코스 생성하기**를 누르면 `/ai-course?from=scan` 빈 코스 편집 화면이 열리고 1번 장소가 방금 인식한 매장으로 채워집니다. 이 OCR 내 위치는 그 두 화면에만 유지되고, 탭·헤더·뒤로가기로 나가면 바로 지웁니다. 국가·언어는 `src/stores/use-preference-store.js`에서 서로 독립적으로 관리하고, SSR에서도 읽을 수 있는 `ditto-country`, `ditto-language` 쿠키에 보존합니다. 인증 정보와 세션 값은 브라우저 저장소에 넣지 않습니다. 한 화면 내부에서만 필요한 상태는 전역 store로 올리지 않고 해당 컴포넌트의 React state로 관리합니다.

국가·언어 설정 우선순위는 다음과 같습니다.

```text
로그인 사용자 → GET /users/me의 DB 설정
비로그인 사용자 → 국가·언어 쿠키
저장된 설정 없음 → 브라우저 언어 + 기본 국가 KR
```

전역 레이아웃이 요청 쿠키와 `Accept-Language`를 읽어 Zustand provider의 첫 상태와 `<html lang>`을 함께 초기화하므로, hydration 이후 언어가 뒤늦게 바뀌는 현상을 막습니다. 국가를 바꾸면 그 국가의 기본 언어를 함께 선택하되, 사용자가 언어를 직접 선택한 뒤에는 국가를 바꿔도 해당 언어를 유지합니다. 헤더에서는 국가와 화면 언어를 별도 선택기로 제공합니다.

선택 언어는 Backend 동적 콘텐츠에도 동일하게 적용됩니다. 브라우저의 모든 Axios 요청은 공통
`src/lib/api/client.js` 인터셉터가 `ditto-language` 쿠키를 읽어 `Accept-Language` 헤더에 넣습니다.
뉴스처럼 Server Component가 직접 호출하는 요청은 `src/lib/api/server-language.js`가 요청 쿠키를 읽어
같은 헤더를 전달합니다. 지원 값은 `ko`, `zh`, `ja`, `en`이며 값이 없거나 잘못되면 `ko`를 사용합니다.
호출부가 `Accept-Language`를 직접 지정한 경우 공통 계층은 해당 값을 덮어쓰지 않습니다.

### 한·중·일·영 UI 다국어

`next-intl` 기반으로 한국어(`ko`), 중국어(`zh`), 일본어(`ja`), 영어(`en`)를 지원합니다. 번역 카탈로그는 `messages/{locale}.json`, 요청별 언어 결정은 `src/i18n/request.js`, 지원 언어와 기본값은 `src/i18n/config.js`에서 관리합니다.

고정 UI 문구는 메시지 키로 관리하며, 언어 선택 쿠키가 바뀌면 서버 컴포넌트까지 같은 언어로 다시 렌더링합니다. 새 문구를 추가할 때는 네 카탈로그에 동일한 키를 추가해야 합니다. 키 구조 일치와 다른 언어 파일의 한국어 혼입은 `pnpm test:i18n`으로 검사합니다.

이번 단계는 메뉴, 제목, 버튼, 입력 안내, 오류와 접근성 문구 같은 프론트 고정 UI만 포함합니다. 뉴스·커뮤니티 게시물·코스명·AI 응답처럼 API나 사용자가 만드는 동적 콘텐츠의 자동 번역은 Azure Translator 연동 단계에서 별도로 처리합니다. 따라서 현재 단계에는 Azure 키가 필요하지 않습니다.

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

## 관리자 화면

`ROLE_ADMIN` 계정만 접근할 수 있는 조회 전용 운영 화면입니다. 일반 서비스 헤더·푸터와 분리된 사이드바 레이아웃을 사용하며, 백엔드가 S3의 최신 트렌드 JSON을 읽어 제공한 결과를 표시합니다.

| 화면 | 경로 | 내용 |
| --- | --- | --- |
| 운영 대시보드 | `/admin` | 산출물 상태, 경고 수, 국가별 TOP 10 미리보기 |
| 국가별 TOP 10 | `/admin/trends/rankings` | 한국·중국·일본·미국 최종 순위 |
| 국가별 후보군 | `/admin/trends/candidates` | 국가별 교차 검증 후보군 |
| YouTube 급상승 | `/admin/trends/youtube` | 최근 7일 전체·한국·일본·미국 급상승 신호 |
| 승인 대기 코스 초안 | `/admin/courses` | 배치가 만든 셀럽 코스 초안 — 카드로 보고, 팝업에서 편집 |

트렌드 화면의 1차 범위는 조회와 새로고침만 지원합니다. 순위 수동 변경, RDS 오버라이드, Lambda 재실행은 포함하지 않습니다.

### 승인 대기 코스 초안 (`/admin/courses`)

`ditto-celeb-warm-2` 배치가 셀럽 한 명을 조사해 **매장 3 + 카페 1 + 여가 1** 짜리 코스 초안을 만들어 Redis에 하루 동안 둡니다. 관리자가 보고 승인해야 손님에게 나갑니다.

초안이 **카드**로 늘어서고, 카드를 누르면 **팝업 편집기**가 열립니다. 화면을 통째로 바꾸지 않는 것은 관리자가 목록으로 돌아오는 비용을 없애기 위해서입니다. `Esc`, 배경 클릭, 닫기 버튼으로 닫습니다.

| 용도 | 메서드 | 엔드포인트 | 클라이언트 함수 |
| --- | --- | --- | --- |
| 초안 목록 조회 | `GET` | `/api/v1/admin/admin-courses` | `getAdminCourses()` |
| 오늘 실행 상황 조회 | `GET` | `/api/v1/admin/admin-courses/run` | `getAdminCourseRun()` |
| 초안 상세 조회 | `GET` | `/api/v1/admin/admin-courses/{celebrity}` | `getAdminCourse(name)` |
| 장소 카탈로그 조회 | `GET` | `/api/v1/admin/admin-courses/places` | `getAdminCoursePlaces()` |

#### 편집기에서 고칠 수 있는 것

| | |
| --- | --- |
| 동선 | 드래그 또는 ↑↓ 버튼으로 순서 변경, ✕ 로 자리 빼기 |
| 매장 교체 | 차순위 후보에서, 또는 더현대 전체 147곳에서 이름·카테고리·층으로 검색 |
| 텍스트 | 안내 문장, 추천 사유, 근거 인물·브랜드·문장, 근거 기사 URL |
| 사진 | 사진 URL, 캡션(`카리나 × 프라다`), 출처, 사진이 실린 기사 URL, 사진 종류 |
| 분류 | 자리의 분류(매장·음식점·카페·여가), 근거 종류(셀럽 근거·동선·관리자) |

- **편집은 저장되지 않습니다.** 백엔드에도 람다에도 초안을 고치는 창구가 아직 없어(읽기와 삭제만 있습니다) 팝업을 닫으면 사라집니다. 결과는 **JSON 복사·내려받기**로 가져가 승인 람다에 넘깁니다. 편집기 맨 위가 이 사실을 계속 말해 줍니다.
- **매장을 갈면 근거는 그대로 두고 근거 사진만 뗍니다.** 남의 브랜드 사진이 새 매장에 붙는 것이 이 배치가 실제로 냈던 사고입니다(카리나 × 디젤 근거 자리에 MLB가 들어갔는데 사진과 캡션만 디젤이었습니다). 새 매장 이름이 근거 브랜드를 품고 있으면 그대로 둡니다.
- 목록은 머리말만 옵니다(인물·상태·코스 모양·경고 수·남은 TTL). 초안 하나가 조사 원문까지 들고 있어 수십 KB라, 전문은 연 초안만 따로 가져옵니다.
- **경고를 펼친 채로 맨 위에 둡니다.** "사진 없음", "근거는 있는데 근거 사진을 못 찾았다", "코스 모양이 어긋났다"가 관리자가 초안에서 제일 먼저 봐야 하는 것입니다.
- 사진은 `next/image`가 아니라 `<img>`로 그립니다. 사진이 기사에서 와서 호스트를 미리 알 수 없는데 `next.config.mjs`의 `remotePatterns`는 호스트를 열거해야 통과시킵니다. 원본이 핫링크를 막으면 그 자리만 접습니다.
- 배치 실행 상황(`/run`)을 못 읽어도 목록은 보입니다 — 위 띠만 접힙니다.

#### 로컬에서 배포된 백엔드에 붙기

프론트만 고칠 때는 백엔드를 로컬에 띄울 필요가 없습니다. `.env.local`을 `.env.example` 그대로 두면 됩니다.

```
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=http://hdf-spring-alb-476185930.ap-northeast-2.elb.amazonaws.com
```

브라우저는 `localhost:3000/api/*`만 부르고 `next.config.mjs`의 rewrite가 서버 사이드로 ALB에 넘깁니다. **같은 오리진이라 CORS를 안 탑니다.** `localhost:3000`은 백엔드 CORS 허용 목록에도 들어 있으므로, `NEXT_PUBLIC_API_BASE_URL`을 절대 주소로 바꿔 브라우저가 ALB를 직접 부르게 해도 동작합니다.

관리자 API는 세션 인증이므로 `pnpm dev`로 띄운 뒤 `/login`에서 **ROLE_ADMIN 계정으로 로그인**해야 `/admin/courses`가 보입니다.

## 실내 지도 정적 자산 (CDN)

실내 지도 원장(JSON **588KB**)과 층 텍스처(PNG **2.2MB**)는 한 번 만들어지면 바뀌지 않습니다. CloudFront 의 `course-resource/*` 동작이 S3 `hdf-ditto-images` 를 내보내고, 오브젝트마다 3주짜리 `Cache-Control` 이 붙어 있습니다.

```
NEXT_PUBLIC_CDN_BASE=https://d1bxld598du04o.cloudfront.net/course-resource
```

| 무엇 | 어디 |
| --- | --- |
| 층 그래프 8개 · 장소 원장 147곳 · 방 폴리곤 · 매니페스트 | `{CDN}/navigation/v2/*.json` |
| 층 텍스처 8장 | `{CDN}/maps/floor-*.png` |

- **비워 두면 `public/` 안의 사본으로 떨어집니다.** 사본을 지우지 않은 것이 CDN 이 막혔을 때의 안전장치이고, 그 경로에도 3주 캐시 헤더를 붙여 뒀습니다(`next.config.mjs`).
- 백엔드의 `ditto.map-assets.base-url` 과 **같은 곳**을 가리켜야 합니다. `GET /api/v1/places/navigation/assets` 가 같은 주소를 돌려주므로, 주소를 옮길 때는 두 곳을 같이 바꿉니다.
- 크로스 오리진이라 CloudFront `course-resource/*` 에 `Managed-SimpleCORS` 응답 헤더 정책이 붙어 있습니다. `Managed-CachingOptimized` 는 `Origin` 을 원본에 넘기지 않아, 버킷 CORS 만으로는 브라우저에서 막힙니다.
- 층 텍스처는 three.js `useTexture` 가 받습니다(`next/image` 가 아닙니다). WebGL 텍스처라 CORS 헤더가 필요하고, 위 정책이 그것을 채웁니다.
- 원장을 다시 만들면 경로의 `v2` 를 올리세요. 같은 키를 덮어쓰면 최대 3주 동안 옛 파일이 나갑니다.

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
- 국가·언어 저장소는 서버에서 쿠키와 브라우저 언어로 초기화하며, 로그인된 경우 DB 값으로 덮어씁니다.
- `/country`에서 국가는 콘텐츠·트렌드 시장, 언어는 화면 표시 언어로 별도 선택합니다.

### 국가·언어 설정 2차 범위

- 지원 국가: `KR`, `CN`, `JP`, `US`
- 지원 언어: `ko`, `zh`, `ja`, `en`
- 저장 API: `PATCH /api/v1/users/me/preferences`
- 세션 복원: `GET /api/v1/users/me`
- 게스트 저장: `ditto-country`, `ditto-language`, `ditto-language-manual` 쿠키
- SSR 초기화: 쿠키가 없으면 `Accept-Language`와 기본 국가 `KR` 사용
- 헤더 선택기: 국가와 화면 언어를 독립적으로 변경
- 국가 변경: 언어를 직접 선택하기 전에는 국가 기본 언어 적용, 직접 선택한 뒤에는 언어 유지

이번 2차에는 설정 우선순위 통합과 첫 렌더링 복원까지 포함합니다. 화면 고정 문구 사전,
실제 UI 전체 언어 전환, 동적 콘텐츠 번역 및 DeepL 연동은 후속 단계입니다.

## Tailwind CSS

Tailwind CSS 4를 사용하며 전역 디자인 토큰은 `src/app/globals.css`의 `@theme`에서 관리합니다.

- 컴포넌트 스타일은 Tailwind 유틸리티 클래스를 우선합니다.
- 반복되는 색상·간격·폰트 값은 디자인 토큰으로 승격합니다.
- 임의의 전역 CSS는 브라우저 기본값이나 공통 토큰처럼 범위가 명확할 때만 추가합니다.

## 환경변수

`.env.example`은 키 이름과 안전한 예시만 포함해 Git에 커밋합니다. 실제 값은 Git에서 제외되는 `.env.local`에 작성합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=/api/v1
NEXT_PUBLIC_LOCAL_USER_ID=
API_PROXY_TARGET=http://hdf-spring-alb-476185930.ap-northeast-2.elb.amazonaws.com
```

| 키 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 브라우저가 호출할 API 기준 경로. 기본값 `/api/v1`. |
| `NEXT_PUBLIC_LOCAL_USER_ID` | 로컬 Spring의 `local` 프로필을 의도적으로 시험할 때만 넣는 `X-User-Id`. 기본값은 비워 둡니다. |
| `API_PROXY_TARGET` | Next가 `/api/*`를 넘길 백엔드 주소. 기본값은 배포된 Backend ALB입니다. |

`NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저 번들에 포함되므로 비밀 키를 넣으면 안 됩니다.
`NEXT_PUBLIC_LOCAL_USER_ID`가 명시된 개발 환경에서만 `X-User-Id` 헤더를 전달합니다. 배포 Backend를 프록시할 때는 비워 두고 실제 `JSESSIONID` 세션으로 인증합니다.
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

## PWA

웹 앱 매니페스트, 홈 화면 아이콘, 서비스 워커, 설치 배너를 포함합니다. 데스크톱에서는 430px 폰 셸로 미리보고, 실제 폰에서는 전체 폭으로 표시됩니다.

| 항목 | 위치 |
| --- | --- |
| 매니페스트 | `src/app/manifest.js` → `/manifest.webmanifest` |
| 앱 아이콘 | `/icons/192`, `/icons/512`, `apple-icon` |
| 서비스 워커 | `public/sw.js` (`PwaRegister`가 등록) |
| 하단 탭 | 홈 · 코스 · 만들기(+) · 뉴스 · 마이 |

설치 방법:

- **Chrome / Edge / Android**: 홈 하단 배너의 "지금 설치하기", 또는 브라우저 메뉴의 앱 설치
- **iOS Safari**: 공유 버튼 → 홈 화면에 추가

서비스 워커는 정적 자산과 홈 셸을 캐시하고, `/api/*` 요청은 항상 네트워크로 보냅니다. 인증 토큰은 캐시하지 않습니다.
