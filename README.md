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
| `/ai-course` | `src/app/ai-course/page.js` | AI 코스 만들기 |
| `/courses` | `src/app/courses/page.js` | 코스 리스트 |
| `/community` | `src/app/community/page.js` | 여행자 커뮤니티 |
| `/news` | `src/app/news/page.js` | 뉴스피드 |
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
│   ├── components/
│   │   ├── common/            # 여러 기능이 공유하는 UI
│   │   └── layout/            # 헤더, 푸터 등 레이아웃 UI
│   ├── lib/
│   │   └── api/               # Axios 공통 설정
│   └── stores/                # Zustand 전역 클라이언트 상태
├── .env.example               # 공개 가능한 환경변수 예시
├── AGENTS.md                  # 에이전트 작업 규칙
├── eslint.config.mjs
├── next.config.mjs
└── package.json
```

기능이 늘어나면 `src/features/auth`, `src/features/courses`처럼 도메인 단위 폴더를 추가합니다.

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

## Zustand 사용법

Zustand는 국가·언어, 다단계 코스 작성 상태, 전역 모달처럼 여러 Client Component가 공유해야 하는 상태에만 사용합니다.

```js
"use client";

import { usePreferenceStore } from "@/stores/use-preference-store";

const countryCode = usePreferenceStore((state) => state.countryCode);
```

- 한 컴포넌트에서만 사용하는 값은 React `useState`를 사용합니다.
- API 응답 목록 전체를 Zustand에 불필요하게 복사하지 않습니다.
- 인증 토큰을 Zustand persist나 `localStorage`에 저장하지 않습니다.
- persist가 필요해질 때는 Next.js hydration 전략을 먼저 정의합니다.

## Tailwind CSS

Tailwind CSS 4를 사용하며 전역 디자인 토큰은 `src/app/globals.css`의 `@theme`에서 관리합니다.

- 컴포넌트 스타일은 Tailwind 유틸리티 클래스를 우선합니다.
- 반복되는 색상·간격·폰트 값은 디자인 토큰으로 승격합니다.
- 임의의 전역 CSS는 브라우저 기본값이나 공통 토큰처럼 범위가 명확할 때만 추가합니다.

## 환경변수

`.env.example`은 키 이름과 안전한 예시만 포함해 Git에 커밋합니다. 실제 값은 Git에서 제외되는 `.env.local`에 작성합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=/api
```

`NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저 번들에 포함되므로 비밀 키를 넣으면 안 됩니다.

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
