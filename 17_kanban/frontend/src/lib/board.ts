export type Card = { id: string; title: string; details: string };
export type Column = { id: string; title: string; cards: Card[] };

function uid() {
  return crypto.randomUUID();
}

function makeCard(title: string, details: string): Card {
  return { id: uid(), title, details };
}

export const initialColumns: Column[] = [
  {
    id: uid(),
    title: "Backlog",
    cards: [
      makeCard("User authentication flow", "Design login, signup, and password reset screens. Confirm OAuth providers with the team."),
      makeCard("Notification service", "Evaluate push vs polling. Decide on FCM vs WebSockets for real-time alerts."),
      makeCard("Accessibility audit", "Run axe-core across all pages and address WCAG 2.1 AA failures."),
    ],
  },
  {
    id: uid(),
    title: "To Do",
    cards: [
      makeCard("Onboarding checklist", "Build the step-by-step welcome flow shown to new users on first login."),
      makeCard("CSV export", "Allow users to download their data as a CSV from the account settings page."),
      makeCard("Dark mode toggle", "Add a theme switcher that persists across sessions via localStorage."),
    ],
  },
  {
    id: uid(),
    title: "In Progress",
    cards: [
      makeCard("Dashboard charts", "Integrate Chart.js for the weekly activity graph. Wire up real data from the API."),
      makeCard("Search indexing", "Set up Elasticsearch index and connect the search bar to live results."),
    ],
  },
  {
    id: uid(),
    title: "Review",
    cards: [
      makeCard("Payment integration", "Stripe checkout and webhook handler. Awaiting security review before merge."),
      makeCard("API rate limiting", "Middleware added; reviewing thresholds with the infra team."),
    ],
  },
  {
    id: uid(),
    title: "Done",
    cards: [
      makeCard("Project scaffold", "Next.js 16 + TypeScript + ESLint configured and deployed to staging."),
      makeCard("Design system tokens", "Color, spacing, and typography tokens agreed and documented in Figma."),
      makeCard("CI pipeline", "GitHub Actions workflow running lint, tests, and build on every PR."),
    ],
  },
];

export function renameColumn(columns: Column[], columnId: string, title: string): Column[] {
  return columns.map((col) =>
    col.id === columnId ? { ...col, title } : col
  );
}

export function addCard(columns: Column[], columnId: string, title: string, details: string): Column[] {
  const card = makeCard(title, details);
  return columns.map((col) =>
    col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
  );
}

export function deleteCard(columns: Column[], columnId: string, cardId: string): Column[] {
  return columns.map((col) =>
    col.id === columnId
      ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
      : col
  );
}

export function moveCard(
  columns: Column[],
  fromColId: string,
  toColId: string,
  fromIndex: number,
  toIndex: number,
): Column[] {
  const fromCol = columns.find((c) => c.id === fromColId)!;
  const card = fromCol.cards[fromIndex];

  if (fromColId === toColId) {
    const cards = [...fromCol.cards];
    cards.splice(fromIndex, 1);
    cards.splice(toIndex, 0, card);
    return columns.map((col) => (col.id === fromColId ? { ...col, cards } : col));
  }

  return columns.map((col) => {
    if (col.id === fromColId) {
      return { ...col, cards: col.cards.filter((_, i) => i !== fromIndex) };
    }
    if (col.id === toColId) {
      const cards = [...col.cards];
      cards.splice(toIndex, 0, card);
      return { ...col, cards };
    }
    return col;
  });
}
