# Architecture Decision Record: Kanban Board App (17_kanban)

## Status
Accepted

## Context
Project 17 is a client-side Kanban board with one board, five renameable columns, card drag-and-drop, add/delete cards, and no persistence. The priority stated in requirements is "slick, professional, gorgeous UI/UX with very simple features." This ADR covers the data model, component architecture, state ownership, DnD strategy, and styling approach across all five implementation phases.

---

## Decision

Build a **client-only Next.js 16 + React 19 app** using:
- A pure-function data layer in `src/lib/board.ts`
- Single `useState<Column[]>` in the root `Board` component (no Context, no external store)
- Cards rendered as `children` of `Column` so DnD wrappers stay encapsulated
- CSS Modules with a fixed five-token color system
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop, `onDragEnd`-only (no live cross-column preview)
- `next/dynamic` with `ssr: false` to prevent `@dnd-kit` hydration ID mismatches

### Technical Approach

`page.tsx` is a Client Component that uses `next/dynamic` with `ssr: false` to load `Board`. This is required because `@dnd-kit` generates sequential `aria-describedby` IDs (`DndDescribedBy-0`, `DndDescribedBy-1`, …) during render; when Next.js SSR produces these IDs server-side and the client assigns different values during hydration, React logs a hydration mismatch. Disabling SSR for `Board` means the DnD tree only ever renders on the client, eliminating the mismatch entirely. All other interactivity is in `"use client"` components; Next.js is used purely as a build toolchain.

State is owned entirely by `Board`. All mutations go through the pure helpers in `board.ts`, which return new arrays without mutation. `Board` passes `onRename`, `onAddCard` callbacks down to `Column`; card deletion is handled by `Card`'s own `onDelete` prop wired directly in `Board`.

Cards are passed as `children` to `Column` rather than being rendered inside `Column`. This keeps `Column` agnostic of card internals and allows `Board` (Phase 4) to wrap cards in `@dnd-kit`'s `SortableContext` and `useSortable` hooks without `Column` knowing anything about DnD.

### Key Components

| File | Role |
|---|---|
| `src/lib/board.ts` | Types (`Card`, `Column`), `initialColumns` dummy data, pure helpers: `renameColumn`, `addCard`, `deleteCard`, `moveCard` |
| `src/lib/board.test.ts` | 10 Vitest unit tests covering all helpers (boundary values, cross-column moves, etc.) |
| `src/components/Board.tsx` | State owner; `DndContext`, `DragOverlay`, per-column `SortableContext`; `onDragEnd` handler |
| `src/components/SortableCard.tsx` | Thin `useSortable` wrapper — extracts `setNodeRef`, `attributes`, `listeners`, `transform`, `transition`, `isDragging` and passes them to `Card` |
| `src/components/Column.tsx` | Column header (inline rename), card list slot (`children`), "Add card" button |
| `src/components/Card.tsx` | Presentational card; accepts `innerRef`, `dragHandleProps`, `isDragging`, `isOverlay` from sortable wrapper |
| `src/components/AddCardModal.tsx` | Fixed-position modal; focus-on-mount; Escape key + backdrop-click dismiss |
| `src/app/page.tsx` | Client Component; `dynamic(() => import("@/components/Board"), { ssr: false })` |

---

## Data Model

```typescript
type Card   = { id: string; title: string; details: string };
type Column = { id: string; title: string; cards: Card[] };
```

IDs are generated with `crypto.randomUUID()` at module load time (inside `initialColumns` factory functions). This means IDs are stable for the lifetime of the JS module but regenerate on hard reload, consistent with the no-persistence requirement.

`moveCard(columns, fromColId, toColId, fromIndex, toIndex)` handles both same-column reorder and cross-column moves in a single function — the `fromColId === toColId` branch does an in-place splice; the cross-column branch filters and inserts in a single `map` pass.

---

## Drag-and-Drop Strategy

`Board` wraps the whole layout in `<DndContext>` and gives each column its own `<SortableContext items={col.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>`. Each card is wrapped in `<SortableCard>`, a thin component that calls `useSortable({ id: card.id })` and forwards the resulting ref, style, and ARIA attributes to the presentational `<Card>`.

**`onDragEnd`-only**: State is only mutated once, in `onDragEnd`. `onDragOver` is not used. This means there is no live cross-column preview (the card does not appear in the destination column until the user releases), but the logic is simple and correct — no risk of double-applying `moveCard` when a cross-column drag ends.

**`findColumnOf` helper**: Locates which column owns a given card ID by scanning `columns`. Called in `onDragStart` (to capture the active card object for `DragOverlay`) and in `onDragEnd` (to find source and destination columns). Runs in O(columns × cards), acceptable for ≤5 columns × ≤N cards.

**`DragOverlay`**: Renders a floating copy of the active card during a drag using `isOverlay` prop on `Card`, which applies a slight rotation and elevated shadow without affecting the original card's layout slot (which fades to `opacity: 0.4` via the `isDragging` prop).

**Sensor**: `PointerSensor` with `activationConstraint: { distance: 5 }` — prevents accidental drags on click/tap by requiring 5px of pointer movement before a drag starts.

**`over.id` resolution**: In `onDragEnd`, `over.id` is either a column ID (user dropped onto an empty column area) or a card ID (user dropped onto a card). The handler checks `columns.find(c => c.id === over.id)` first; if no column matches, it falls back to `findColumnOf(over.id)` to locate the column that owns the card being hovered.

---

## Consequences

### Positive
- No state management library needed — five columns of cards fit comfortably in a single `useState`
- Pure helpers are trivially testable and already covered by 10 unit tests
- `children` pattern decouples `Column` from DnD: Phase 4 adds DnD without touching `Column`'s internal logic
- CSS Modules prevent leakage; one file per component keeps styles co-located and easy to find

### Negative
- `onDragEnd`-only means no live cross-column preview — the card does not follow the cursor into the destination column until release
- Prop drilling through Board → Column → (implicitly Card) — acceptable at this depth, would need Context if hierarchy grew
- `initialColumns` IDs are regenerated each module load; if the module is ever code-split differently, IDs could change mid-session (not an issue at current scale)
- No persistence means all board state is lost on reload — intentional per requirements, but surprising to first-time users

### Risks
- `ssr: false` makes the board invisible without JavaScript — acceptable for a productivity tool, not acceptable for a public-facing page
- `crypto.randomUUID()` requires a secure context (HTTPS or localhost); the app breaks on plain HTTP
- The `children` pattern for cards means `Board` must know how to render cards; if multiple card types were ever needed, this coupling would show

---

## Alternatives Considered

### Alternative 1: Context + useReducer for state
**Description**: Move `Column[]` state into a React Context with a `useReducer` dispatch for mutations.
**Pros**: Avoids prop drilling; dispatch actions are easy to log/replay.
**Cons**: Unnecessary overhead for a single-board app with ≤5 columns; the reducer would just wrap the same pure helpers. Added when hierarchy deepens.

### Alternative 2: Render cards inside Column (not as children)
**Description**: Pass the column data to `Column` and let it render `<Card>` components internally.
**Pros**: Simpler prop surface on `Board`.
**Cons**: Forces DnD `SortableContext` and `useSortable` hooks into `Column`, coupling it tightly to the DnD library. The `children` pattern keeps `Column` library-agnostic.

### Alternative 3: `onDragOver` + `onDragEnd` for live cross-column preview
**Description**: Move cards to the destination column in `onDragOver` (fires continuously during drag) for a live preview, and use `onDragEnd` to finalize position.
**Pros**: Cards visually follow the cursor into the destination column in real time.
**Cons**: Requires tracking the "original" column in separate state to avoid double-applying `moveCard` in `onDragEnd` after `onDragOver` has already moved the card. The added complexity is not justified for this MVP; the simpler `onDragEnd`-only approach is correct and ships faster.

### Alternative 4: Zustand or Jotai for global state
**Description**: Store `Column[]` in a Zustand store.
**Pros**: Eliminates all prop drilling; devtools for free.
**Cons**: External dependency for a problem that doesn't exist at this scale. The requirements explicitly call for simplicity.

---

## Implementation Details

### Dependencies

Runtime:
- `next@16.2.6`, `react@19.2.4`, `react-dom@19.2.4`
- `@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`, `@dnd-kit/utilities@^3.2.2` (wired in Phase 4)
- `lucide-react@^1.14.0` — `<Plus>`, `<X>`, `<Sparkles>` icons

Dev / test:
- `vitest@^4.1.5`, `@playwright/test@^1.59.1`
- `@testing-library/react@^16.3.2` (available, unused in current unit tests)

### Color System

All five tokens from `CLAUDE.md` used consistently across all CSS Modules:

| Token | Hex | Usage |
|---|---|---|
| Dark Navy | `#032147` | Board background, card text, modal headings |
| Blue Primary | `#209dd7` | Card left accent stripe, output borders |
| Purple Secondary | `#753991` | "Add card" modal submit button |
| Accent Yellow | `#ecad0a` | Column title input border (focus state) |
| Gray Text | `#888888` | Card details, "Add card" button default state, labels |

### Configuration

| Parameter | Value |
|---|---|
| Column width | `280px` fixed |
| Column card list max-height | `calc(100vh - 220px)` with overflow-y scroll |
| Card details clamp | `-webkit-line-clamp: 2` |
| Modal max-width | `440px` |
| Dev server port | `3003` (Playwright config) |
| DnD activation distance | `5px` (`PointerSensor` constraint) |
| Unit test count | 10 (all passing) |
| E2E test count | 5 (all passing — load, rename, add, cancel, delete) |

---

## Validation

```bash
cd 17_kanban/frontend
npm run test        # 10 unit tests — data model + pure helpers (all pass)
npm run build       # TypeScript compile check (clean)
npm run test:e2e    # 5 Playwright E2E tests (all pass): board load, rename,
                    # add card, cancel modal, delete card
```

## References
- Requirements: `17_kanban/CLAUDE.md`
- Data layer: `17_kanban/frontend/src/lib/board.ts`
- State owner: `17_kanban/frontend/src/components/Board.tsx`

## Review Schedule
Re-evaluate if: column count becomes dynamic (needs persistence + backend), card types multiply (needs polymorphic rendering in Board), or drag-and-drop library changes (DnD is isolated to Board, so swap is low-risk).
