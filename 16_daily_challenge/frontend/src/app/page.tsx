"use client";

import { Clipboard, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import {
  type Category,
  categories,
  getTodayKey,
  pickRandomChallenge,
} from "@/lib/challenges";
import styles from "./page.module.css";

export default function Home() {
  const [category, setCategory] = useState<Category>("All");
  const [challenge, setChallenge] = useState(
    "Choose a category, then generate today's challenge.",
  );
  const [notice, setNotice] = useState("Ready when you are.");
  const dailyChallenges = useRef<Record<string, string>>({});

  function generateChallenge() {
    const key = `${getTodayKey()}-${category}`;
    const nextChallenge =
      dailyChallenges.current[key] ?? pickRandomChallenge(category);

    dailyChallenges.current[key] = nextChallenge;
    setChallenge(nextChallenge);
    setNotice(`Today's ${category.toLowerCase()} challenge is set.`);
  }

  async function copyChallenge() {
    try {
      await navigator.clipboard.writeText(challenge);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Clipboard access was blocked.");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="page-title">
        <div className={styles.header}>
          <span className={styles.kicker}>Daily Challenge</span>
          <h1 id="page-title">Pick a bright little mission for today</h1>
        </div>

        <div className={styles.controls}>
          <label className={styles.field}>
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button className={styles.generateButton} onClick={generateChallenge}>
            <Sparkles size={20} aria-hidden="true" />
            Generate
          </button>
        </div>

        <blockquote className={styles.output} aria-live="polite">
          {challenge}
        </blockquote>

        <div className={styles.footer}>
          <p role="status">{notice}</p>
          <button className={styles.copyButton} onClick={copyChallenge}>
            <Clipboard size={18} aria-hidden="true" />
            Copy
          </button>
        </div>
      </section>
    </main>
  );
}
