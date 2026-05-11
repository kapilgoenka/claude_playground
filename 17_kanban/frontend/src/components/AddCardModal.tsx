"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AddCardModal.module.css";

type Props = {
  columnTitle: string;
  onAdd: (title: string, details: string) => void;
  onClose: () => void;
};

export default function AddCardModal({ columnTitle, onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), details.trim());
    onClose();
  }

  return (
    <div className={styles.backdrop} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className={styles.heading}>
          Add card to <span>{columnTitle}</span>
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Details</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional context or notes"
              rows={3}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.addBtn} disabled={!title.trim()}>
              Add card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
