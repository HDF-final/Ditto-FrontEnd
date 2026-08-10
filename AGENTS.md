<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DITTO project instructions

## Product context

- DITTO helps visitors from China, Japan, and the United States discover country-specific K-culture trends, create an AI-assisted course, customize it, use it with a mobile indoor map, and share it with the traveler community.
- The current milestone is the web and responsive-mobile front-end foundation. Do not invent backend behavior or API contracts that have not been provided.
- Keep README.md accurate when setup, commands, routes, environment variables, or architecture change.

## Required stack

- Use Next.js App Router and React with JavaScript. Do not introduce TypeScript unless the user explicitly changes this decision.
- Use Tailwind CSS for application styling.
- Use the shared Axios instance at `src/lib/api/client.js` for browser REST requests. Do not create feature-local Axios instances.
- Use Zustand for shared client state. Prefer local React state for component-local concerns.
- Use pnpm only. Commit `package.json` and `pnpm-lock.yaml` together, and never edit the lockfile manually.

## Next.js boundaries

- Pages and layouts are Server Components by default.
- Add `"use client"` only at the smallest boundary that needs state, events, browser APIs, custom hooks, Axios browser calls, or Zustand.
- Keep `src/app` focused on routing and route composition. Place reusable UI in `src/components`, shared utilities in `src/lib`, and shared client state in `src/stores`.
- Use `next/link` for internal navigation and Next.js metadata exports for page metadata.
- Await dynamic `params` and `searchParams` in Server Component pages when they are introduced.

## Data and security

- Do not store access tokens, refresh tokens, session identifiers, or other credentials in localStorage, sessionStorage, or persisted Zustand stores.
- Keep secrets in server-only environment variables. Treat every `NEXT_PUBLIC_` value as public.
- Do not set a global multipart `Content-Type`; allow the browser and Axios to set the boundary.
- Do not duplicate server response collections into Zustand without a documented client-state requirement.
- Keep API endpoint functions grouped by feature once real API contracts are available.

## Styling

- Use Tailwind utilities before adding custom CSS.
- Keep shared colors, typography, spacing, and other design primitives in the Tailwind theme tokens in `src/app/globals.css`.
- Preserve responsive behavior and keyboard-visible focus states.
- Reuse components instead of copying repeated markup across routes.

## Dependency policy

- Ask before adding a new production dependency unless it is explicitly required by the user's request.
- Prefer platform and existing dependency capabilities before adding packages.
- Use `pnpm add`, `pnpm add -D`, and `pnpm remove`; do not mix npm or Yarn lockfiles into the repository.

## Verification

After changing application code:

1. Run `pnpm lint`.
2. Run `pnpm build`.
3. When runtime behavior changes, start `pnpm dev` and verify the affected route at `http://localhost:3000`.

Do not report work complete while a required check is failing. If a check cannot run, state exactly why.

## Change discipline

- Preserve user work and avoid unrelated rewrites.
- Keep changes small enough to review and explain non-obvious architecture decisions.
- Do not commit generated build output, environment secrets, or local editor files.
- Expand this file gradually as repeatable project conventions emerge; keep detailed product and architecture prose in README.md or dedicated docs.
