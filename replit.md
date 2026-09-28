# ATS Resume Scorer

A browser-only resume analysis tool that compares a resume with a target role and turns ATS signals into prioritized edits.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ats-resume-scorer/src/App.tsx` — product shell, dashboard, analyzer, report views, local scoring logic
- `artifacts/ats-resume-scorer/src/index.css` — dashboard visual theme, responsive layout, score/report components
- `artifacts/ats-resume-scorer` — deployable React/Vite web artifact

## Architecture decisions

- Resume and job description text are analyzed locally in the browser; no upload or API is required for the first version.
- Scoring is deterministic and explainable across parsing health, keyword alignment, impact signals, and clarity.
- Session history is intentionally ephemeral because there is no account or persistence layer in this version.

## Product

- Paste resume and target role text or load a supported text file.
- Try a demo resume and role to see the full report.
- Move between Dashboard, Analyze Resume, My Reports, Saved Jobs, Profile, and Settings views.
- Get an overall score, weighted signal breakdown, parser readout, and prioritized fixes with examples.
- Copy or download a concise text report.

## User preferences

_No project-specific preferences recorded._

## Gotchas

- Text file import supports `.txt`, `.md`, and `.rtf`; binary PDF/DOCX parsing is not included in the browser-only version.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
