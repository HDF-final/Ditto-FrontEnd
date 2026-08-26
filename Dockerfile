# 1. Base Node.js 환경
FROM node:20-alpine AS base

# 2. 종속성 설치 (Dependencies)
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 3. 빌드 (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 텔레메트리 비활성화 및 빌드
ENV NEXT_TELEMETRY_DISABLED=1

# 지도 원장(JSON)·층 텍스처(PNG)를 받아 올 CDN 주소.
#
# `NEXT_PUBLIC_*` 는 **이 빌드 시점에** 번들로 박히는 값입니다. 컨테이너를 띄울 때 주는
# `--env-file` 은 서버 프로세스에만 닿고 브라우저가 받는 코드에는 못 닿습니다 — 그래서
# 이 값은 배포 스크립트의 .env 가 아니라 여기서 줘야 합니다.
#
# 안 주면 소스의 기본값(CloudFront `course-resource/*`)을 씁니다. 다른 버킷·배포로
# 옮길 때만 `docker build --build-arg NEXT_PUBLIC_CDN_BASE=https://...` 로 주세요.
ARG NEXT_PUBLIC_CDN_BASE

# 빈 값은 "CDN 말고 public/ 사본으로 떨어져라" 라는 뜻입니다. `ARG` 를 선언만 하고 안
# 주면 도커가 빈 값으로 넘길 수 있어, 안 준 것과 구분되게 지웁니다 — 안 그러면 빌드가
# 조용히 폴백으로 떨어집니다.
RUN if [ -z "${NEXT_PUBLIC_CDN_BASE:-}" ]; then unset NEXT_PUBLIC_CDN_BASE; fi; \
    npm run build

# 4. 런타임 실행 (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 보안을 위한 비-루트 유저 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone 및 정적 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]