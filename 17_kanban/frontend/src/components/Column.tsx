"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import type { Column as ColumnType } from "@/lib/board";
import AddCardModal from "./AddCardModal";
import styles from "./Column.module.css";

type Props = {
  column: ColumnType;
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  children: React.ReactNode;
  droppableProps?: Record<string, unknown>;
  innerRef?: React.Ref<HTMLElement>;
};

export default function Column({
  column,
  onRename,
  onAddCard,
  children,
  droppableProps,
  innerRef,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(column.title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setIsEditing(false);
  }

  return (
    <>
      <section
        className={styles.column}
        ref={innerRef as React.RefObject<HTMLElement>}
        {...droppableProps}
      >
        <header className={styles.header}>
          {isEditing ? (
            <input
              ref={inputRef}
              className={styles.titleInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <button className={styles.titleBtn} onClick={startEditing} title="Click to rename">
              {column.title}
            </button>
          )}
          <span className={styles.count}>{column.cards.length}</span>
        </header>

        <div className={styles.cards}>{children}</div>

        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={16} aria-hidden="true" />
          Add card
        </button>
      </section>

      {showModal && (
        <AddCardModal
          columnTitle={column.title}
          onAdd={onAddCard}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
