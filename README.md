# HomePath

Inclusive housing access for Nigeria — hackathon build. See [docs/HomePath_Team_Brief.docx](docs/HomePath_Team_Brief.docx)
for the pitch/problem framing and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the engineering
source of truth (this supersedes the brief's tech-stack and TrustLayer sections).

## Structure

```
HomePath/
├── frontend/        Next.js app (React, TypeScript, Tailwind v4, Biome)
├── backend/         NestJS API (Prisma, PostgreSQL)
├── docs/            Team brief + architecture doc
├── package.json     Root workspace manifest
└── pnpm-workspace.yaml
```

Each package keeps its own `package.json`, scripts, and dependencies. The root only coordinates
installs across both — it has no app code of its own.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) (this repo uses pnpm workspaces; npm/yarn are not supported here)
- PostgreSQL running locally (native install — no Docker Compose for this project; see
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §3)

## Getting started

Install dependencies for both packages from the repo root:

```bash
pnpm install
```

### Run the backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL to your local Postgres, add JWT_SECRET, ANTHROPIC_API_KEY
pnpm prisma:migrate
pnpm prisma:seed
pnpm start:dev
```

Backend runs at [http://localhost:3001/api/v1](http://localhost:3001/api/v1).

### Run the frontend

```bash
cd frontend
cp .env.example .env.local   # if applicable
pnpm dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

## Working across packages

Common pnpm workspace commands, run from the repo root:

```bash
pnpm install                              # install deps for all packages
pnpm --filter frontend <script>           # run a script scoped to frontend
pnpm --filter backend <script>            # run a script scoped to backend
pnpm -r <script>                          # run a script in every package that defines it
```

## Design system

The frontend reuses the same token-based design system architecture as our other pnpm/Next.js/Nest
projects (semantic CSS custom properties, light/dark split, Tailwind v4 `@theme inline`, self-hosted
Satoshi font) — recolored to a "trust blue" brand palette instead of magenta, since TrustLayer's own
score bands (green/yellow/red) already use green/yellow/red semantically. See
`frontend/src/app/styles/design-tokens-light.css` and `design-tokens-dark.css`.

## Core architectural principle

TrustLayer's Trust Score is a deterministic composite of a registry lookup and community reports.
AI (Claude API) is used only to narrate an already-computed score — it never determines the score
itself and never claims to verify document authenticity or ownership. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §2 before touching `backend/src/trust-layer/`.
