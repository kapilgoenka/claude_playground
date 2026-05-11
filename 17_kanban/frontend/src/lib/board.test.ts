import { describe, expect, it } from "vitest";
import { addCard, deleteCard, initialColumns, moveCard, renameColumn } from "./board";

const [backlog, todo, inProgress] = initialColumns;

describe("initialColumns", () => {
  it("has exactly 5 columns", () => {
    expect(initialColumns).toHaveLength(5);
  });

  it("each column has at least one card", () => {
    for (const col of initialColumns) {
      expect(col.cards.length).toBeGreaterThan(0);
    }
  });
});

describe("renameColumn", () => {
  it("updates the title of the target column", () => {
    const result = renameColumn(initialColumns, backlog.id, "Ideas");
    expect(result.find((c) => c.id === backlog.id)!.title).toBe("Ideas");
  });

  it("leaves other columns unchanged", () => {
    const result = renameColumn(initialColumns, backlog.id, "Ideas");
    expect(result.find((c) => c.id === todo.id)!.title).toBe(todo.title);
  });
});

describe("addCard", () => {
  it("appends a new card to the target column", () => {
    const before = backlog.cards.length;
    const result = addCard(initialColumns, backlog.id, "New task", "Details here");
    const after = result.find((c) => c.id === backlog.id)!.cards;
    expect(after).toHaveLength(before + 1);
    expect(after[after.length - 1].title).toBe("New task");
    expect(after[after.length - 1].details).toBe("Details here");
  });

  it("does not mutate other columns", () => {
    const result = addCard(initialColumns, backlog.id, "X", "");
    expect(result.find((c) => c.id === todo.id)!.cards).toHaveLength(
      todo.cards.length,
    );
  });
});

describe("deleteCard", () => {
  it("removes the specified card", () => {
    const target = backlog.cards[0];
    const result = deleteCard(initialColumns, backlog.id, target.id);
    const remaining = result.find((c) => c.id === backlog.id)!.cards;
    expect(remaining.find((c) => c.id === target.id)).toBeUndefined();
    expect(remaining).toHaveLength(backlog.cards.length - 1);
  });
});

describe("moveCard", () => {
  it("reorders within the same column", () => {
    const [first, second] = backlog.cards;
    const result = moveCard(initialColumns, backlog.id, backlog.id, 0, 1);
    const cards = result.find((c) => c.id === backlog.id)!.cards;
    expect(cards[0].id).toBe(second.id);
    expect(cards[1].id).toBe(first.id);
  });

  it("moves a card to another column at the correct index", () => {
    const card = backlog.cards[0];
    const result = moveCard(initialColumns, backlog.id, todo.id, 0, 0);
    const fromCards = result.find((c) => c.id === backlog.id)!.cards;
    const toCards = result.find((c) => c.id === todo.id)!.cards;
    expect(fromCards.find((c) => c.id === card.id)).toBeUndefined();
    expect(toCards[0].id).toBe(card.id);
  });

  it("does not mutate unrelated columns", () => {
    const result = moveCard(initialColumns, backlog.id, todo.id, 0, 0);
    expect(result.find((c) => c.id === inProgress.id)!.cards).toHaveLength(
      inProgress.cards.length,
    );
  });
});
