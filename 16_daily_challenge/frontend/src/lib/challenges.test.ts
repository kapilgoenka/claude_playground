import { describe, expect, it } from "vitest";
import {
  categories,
  challengePool,
  getChallengesForCategory,
  getTodayKey,
  pickRandomChallenge,
} from "./challenges";

describe("challenge data", () => {
  it("contains ten challenges for every concrete category", () => {
    expect(categories).toEqual(["All", "Fitness", "Learning", "Kindness"]);

    for (const challenges of Object.values(challengePool)) {
      expect(challenges).toHaveLength(10);
    }
  });

  it("combines all category pools for All", () => {
    expect(getChallengesForCategory("All")).toHaveLength(30);
  });
});

describe("challenge selection", () => {
  it("returns the first challenge when random is zero", () => {
    expect(pickRandomChallenge("Fitness", () => 0)).toBe(challengePool.Fitness[0]);
  });

  it("returns the last challenge when random is close to one", () => {
    expect(pickRandomChallenge("Kindness", () => 0.999)).toBe(
      challengePool.Kindness[9],
    );
  });

  it("formats the current date key", () => {
    expect(getTodayKey(new Date("2026-05-10T18:51:00-07:00"))).toBe(
      "2026-05-10",
    );
  });
});
