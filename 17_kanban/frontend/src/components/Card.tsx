"use client";

import { X } from "lucide-react";
import type { Card as CardType } from "@/lib/board";
import styles from "./Card.module.css";

type Props = {
  card: CardType;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
  style?: React.CSSProperties;
  isDragging?: boolean;
  isOverlay?: boolean;
  innerRef?: (el: HTMLElement | null) => void;
};

export default function Card({ card, onDelete, dragHandleProps, style, isDragging, isOverlay, innerRef }: Props) {
  return (
    <article
      ref={innerRef}
      className={`${styles.card} ${isDragging ? styles.dragging : ""} ${isOverlay ? styles.overlay : ""}`}
      style={style}
      {...dragHandleProps}
    >
      <div className={styles.body}>
        <h3 className={styles.title}>{card.title}</h3>
        {card.details && <p className={styles.details}>{card.details}</p>}
      </div>
      <button
        className={styles.deleteBtn}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label={`Delete card: ${card.title}`}
      >
        <X size={14} />
      </button>
    </article>
  );
}
