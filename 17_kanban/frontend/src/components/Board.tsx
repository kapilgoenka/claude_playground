"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import {
  addCard,
  deleteCard,
  initialColumns,
  moveCard,
  renameColumn,
} from "@/lib/board";
import type { Card as CardType, Column as ColumnType } from "@/lib/board";
import Card from "./Card";
import Column from "./Column";
import SortableCard from "./SortableCard";
import styles from "./Board.module.css";

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function findColumnOf(cardId: string) {
    return columns.find((col) => col.cards.some((c) => c.id === cardId));
  }

  function handleDragStart({ active }: DragStartEvent) {
    const col = findColumnOf(active.id as string);
    setActiveCard(col?.cards.find((c) => c.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const fromCol = findColumnOf(active.id as string);
    if (!fromCol) return;

    const toCol =
      columns.find((c) => c.id === over.id) ??
      findColumnOf(over.id as string);
    if (!toCol) return;

    const fromIndex = fromCol.cards.findIndex((c) => c.id === active.id);
    const overIndex = toCol.cards.findIndex((c) => c.id === over.id);
    const toIndex = overIndex === -1 ? toCol.cards.length : overIndex;

    if (fromCol.id === toCol.id && fromIndex === toIndex) return;

    setColumns((cols) => moveCard(cols, fromCol.id, toCol.id, fromIndex, toIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            onRename={(title) => setColumns((c) => renameColumn(c, col.id, title))}
            onAddCard={(title, details) =>
              setColumns((c) => addCard(c, col.id, title, details))
            }
          >
            <SortableContext
              items={col.cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {col.cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onDelete={() =>
                    setColumns((c) => deleteCard(c, col.id, card.id))
                  }
                />
              ))}
            </SortableContext>
          </Column>
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <Card card={activeCard} onDelete={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
