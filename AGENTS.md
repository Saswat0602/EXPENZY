# Repository Guidelines

## Project Structure & Module Organization
- Frontend lives in `expenzy/` and follows Next.js App Router (`app/`), with shared UI in `components/` (feature, layout, modal, shared, ui) and business logic in `lib/` (React Query hooks, validation schemas, utilities). Types reside in `types/`, global providers in `contexts/`, and static assets in `public/`.
- Styling relies on Tailwind 4 (via `app/globals.css`) plus root theme tokens in `theme.css` and notes in `theme.md`. Do not hand-edit shadcn components in `components/ui`; regenerate instead.
- Backend sits in `../expense-tracker-server` (NestJS + Prisma); coordinate API changes with its maintainers before altering frontend contracts.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server on :3000.
- `npm run lint` — ESLint (core-web-vitals) check; fix warnings before opening a PR.
- `npm run build` / `npm run start` — production build and serve; run locally before release cuts.
- Keep secrets in `.env.local` (never commit). Ensure backend URL/auth settings are present before running dev.

## Coding Style & Naming Conventions
- Use TypeScript, functional components, and React hooks; favor server components unless client interactivity is needed (`"use client"` at the top).
- Reuse existing hooks in `lib/hooks/` for data access; avoid new fetch clients. Validate forms with `lib/validations/` schemas and compose classes with `lib/utils/cn`.
- Components, pages, and hooks use PascalCase/feature-based folders; hooks as `use-*.ts`, Zod schemas as `*.schema.ts` or `schemas.ts`. Prefer named exports; keep files short and focused.

## Testing Guidelines
- No dedicated test suite is present yet; at minimum run `npm run lint`. When adding features, include lightweight component or hook tests colocated with the feature (e.g., `feature-name/__tests__/Component.test.tsx`) and mock network calls.
- Before merging, exercise critical flows manually: auth, dashboard load, CRUD modals, and React Query cache updates after mutations.

## Commit & Pull Request Guidelines
- Follow conventional prefixes (`feat:`, `fix:`, `chore:`, `docs:`) as seen in history; one logical change per commit.
- PRs should describe scope, risks, and how to validate. Link related issues. Include screenshots/GIFs for UI changes and note impacted routes.
- Run `npm run lint` and, when applicable, `npm run build` before requesting review. Update docs (`FILE_STRUCTURE.md`, README) when structure or behavior shifts.

## Security & Configuration Tips
- Never commit secrets or service tokens. Rotate local keys if exposed. Keep auth/session logic consistent with NextAuth configuration under `app/api/auth/`.
- API shape changes must stay in sync with `../expense-tracker-server`; coordinate migrations and bump client helpers in `lib/api/` before merging.
