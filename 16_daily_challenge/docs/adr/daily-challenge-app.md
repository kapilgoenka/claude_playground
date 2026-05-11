# Architecture Decision Record: Daily Challenge App (16_daily_challenge)

## Status
Accepted

## Context
Project 16 is a single-page "Daily Challenge" generator. The requirements were:
- Pick a random challenge from a pool (Fitness / Learning / Kindness / All)
- Ensure the same challenge is returned for the same date + category within a session
- Copy challenge text to the clipboard with user feedback
- Cheerful gradient UI; no login, no server, no database for the MVP

The implementation lives in `16_daily_challenge/frontend/` as a Next.js app.

## Decision

Build a **client-only Next.js 16 + React 19 app** with:
- Static in-code challenge pools (no API, no database)
- In-memory session memoization via `useRef` (no `localStorage`)
- CSS Modules for component-scoped styles
- Dual test strategy: Vitest for pure logic, Playwright for E2E

### Technical Approach

The single page (`src/app/page.tsx`) is marked `"use client"`. All logic runs
in the browser; Next.js provides the build toolchain and routing scaffold but
no server-side features are used.

Challenge pools are a plain TypeScript `Record` in `src/lib/challenges.ts`.
`pickRandomChallenge()` accepts an injectable `random` function (default
`Math.random`) so it is deterministically testable without mocks or patches.

Per-session date-scoping is done by composing a `${dateKey}-${category}` map
key and storing it in a `useRef` (`dailyChallenges.current`). Repeated clicks
of "Generate" for the same date + category return the cached value rather than
re-rolling.

### Key Components

| File | Role |
|---|---|
| `src/lib/challenges.ts` | Challenge data, `getChallengesForCategory`, `pickRandomChallenge`, `getTodayKey` |
| `src/app/page.tsx` | Single page: state, generate/copy handlers, JSX |
| `src/app/page.module.css` | All styles (gradient background, card, buttons, responsive breakpoints) |
| `src/app/layout.tsx` | Root layout: Geist font loading, `<html>` shell, page metadata |
| `src/lib/challenges.test.ts` | Vitest unit tests for pure functions |
| `tests/e2e/daily-challenge.spec.ts` | Playwright E2E: generate → remember → copy flow |

## Consequences

### Positive
- Zero backend infrastructure — no deploy complexity, no runtime cost
- Pure functions in `challenges.ts` are trivially testable with an injectable `random` param
- CSS Modules prevent style leakage and make the color system explicit in one file
- Vitest + Playwright together cover both unit correctness and real browser behavior

### Negative
- Challenge remembered only for the browser session; refreshing picks a new one
- Static challenge pool requires a code change to add or edit challenges
- "All" category draws from a flat 30-item pool with no weighting; frequent users will
  see repeats within a small window

### Risks
- `navigator.clipboard.writeText` requires a secure context (HTTPS or localhost);
  the copy button degrades gracefully with an error notice but is broken on plain HTTP
- Challenge memoization lives in `useRef` state, so it resets on hard reload — this
  matches the "no persistence" requirement but could surprise users who expect
  the same challenge all day across tabs

## Alternatives Considered

### Alternative 1: LocalStorage persistence
**Description**: Write the chosen challenge to `localStorage` keyed by date + category
so it survives page refreshes and is consistent across tabs.  
**Pros**: Delivers a genuinely persistent "one challenge per day" experience  
**Cons**: Adds a browser-storage dependency and complicates hydration (SSR/CSR mismatch);
the MVP requirements explicitly called for no persistence

### Alternative 2: Server-side deterministic selection
**Description**: Move `pickRandomChallenge` to a Next.js API route or Server Component
that seeds randomness from the date, ensuring the same challenge for all users on a
given day.  
**Pros**: Consistent across users; no client-side memoization needed  
**Cons**: Requires a server, adds latency, and is overkill for a personal playground
app; sharing a single challenge across all users was not a requirement

### Alternative 3: External challenge API or CMS
**Description**: Fetch challenges from a third-party API or headless CMS.  
**Pros**: Content editable without a code deploy  
**Cons**: Adds network dependency, API key management, and failure modes; pool of
30 challenges is small enough to live in source

## Implementation Details

### Dependencies

Runtime:
- `next@16.2.6` — app framework and build toolchain
- `react@19.2.4`, `react-dom@19.2.4` — UI rendering
- `lucide-react@^1.14.0` — `<Sparkles>` and `<Clipboard>` icons

Dev / test:
- `vitest@^4.1.5` — unit test runner
- `@playwright/test@^1.59.1` — E2E browser tests
- `@testing-library/react@^16.3.2` — React test utilities (available, unused in current tests)

### Configuration

| Parameter | Value |
|---|---|
| Challenges per category | 10 |
| Total "All" pool size | 30 (10 × 3 categories) |
| Max card width | 720 px |
| Responsive breakpoint | 640 px (stacks controls and footer vertically) |
| Output font size | `clamp(1.55rem, 4vw, 2.35rem)` |

Color system (from AGENTS.md):

| Token | Hex | Usage |
|---|---|---|
| Accent Yellow | `#ecad0a` | kicker underline, focus ring |
| Blue Primary | `#209dd7` | output border, Copy button |
| Purple Secondary | `#753991` | kicker text, Generate button |
| Dark Navy | `#032147` | headings, body text |
| Gray Text | `#888888` | labels, status line |

### Performance Considerations
All challenge data is bundled at build time (~30 short strings). No network
requests at runtime beyond font loading. `pickRandomChallenge` and `getTodayKey`
are synchronous and sub-millisecond.

## Validation
- `vitest run` — 5 unit tests covering pool sizes, boundary-value random selection,
  and date key formatting
- `playwright test` — 1 E2E test covering generate → idempotency → copy → clipboard
  read back

## References
- Requirements: `16_daily_challenge/AGENTS.md`
- Challenge data and logic: `16_daily_challenge/frontend/src/lib/challenges.ts`
- UI and state: `16_daily_challenge/frontend/src/app/page.tsx`

## Review Schedule
Re-evaluate if: challenge pool grows beyond ~50 items per category (consider dynamic
loading), or if a "same challenge all day" guarantee across sessions/tabs becomes a
requirement (switch to `localStorage` or a server-seeded approach).
