"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/lib/board";
import Card from "./Card";

type Props = {
  card: CardType;
  onDelete: () => void;
};

export default function SortableCard({ card, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      card={card}
      onDelete={onDelete}
      dragHandleProps={{ ...attributes, ...listeners }}
      style={style}
      isDragging={isDragging}
      innerRef={setNodeRef}
    />
  );
}
