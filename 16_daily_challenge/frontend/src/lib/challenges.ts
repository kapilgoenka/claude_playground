export type Category = "All" | "Fitness" | "Learning" | "Kindness";

export const categories: Category[] = ["All", "Fitness", "Learning", "Kindness"];

export const challengePool: Record<Exclude<Category, "All">, string[]> = {
  Fitness: [
    "Take a brisk 20-minute walk and notice five things that make the route feel alive.",
    "Do three rounds of ten squats, ten wall pushups, and a thirty-second plank.",
    "Stretch for ten minutes while playing a song that instantly lifts your mood.",
    "Try a new bodyweight move and practice it slowly for five careful minutes.",
    "Drink a full glass of water before each meal today.",
    "Climb stairs for five minutes, taking breaks whenever you need them.",
    "Do a balance challenge: stand on one foot for thirty seconds per side, three times.",
    "Dance to two upbeat songs without worrying about what it looks like.",
    "Set a timer and take a movement break every hour for the next four hours.",
    "Finish the day with gentle neck, shoulder, and hip stretches.",
  ],
  Learning: [
    "Read one short article about a topic you usually skip and write down one surprising fact.",
    "Learn five words in a language you do not speak yet.",
    "Watch a ten-minute tutorial and try the smallest possible version of what it teaches.",
    "Ask someone to explain a tool, hobby, or habit they know well.",
    "Spend fifteen minutes reading a book with your phone in another room.",
    "Pick a question you have been carrying around and research it until you find one solid answer.",
    "Review an old note and add three new thoughts to it.",
    "Learn one keyboard shortcut for an app you use often and practice it today.",
    "Write a tiny summary of something you already know as if teaching it to a beginner.",
    "Find a map of a place you have never visited and learn three landmarks.",
  ],
  Kindness: [
    "Send a specific thank-you note to someone who made your week easier.",
    "Let someone go ahead of you in a line or conversation today.",
    "Leave a thoughtful review for a small business, creator, or project you appreciate.",
    "Check in on a friend with a message that does not ask for anything back.",
    "Do one household task before anyone has to ask.",
    "Compliment someone on an effort you genuinely noticed.",
    "Donate, recycle, or give away one useful item you no longer need.",
    "Write down three kind things about yourself without making a joke out of them.",
    "Bring patience to one annoying moment and let it pass cleanly.",
    "Share a resource, recommendation, or contact that could help someone else.",
  ],
};

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getChallengesForCategory(category: Category) {
  if (category === "All") {
    return Object.values(challengePool).flat();
  }

  return challengePool[category];
}

export function pickRandomChallenge(
  category: Category,
  random = Math.random,
) {
  const pool = getChallengesForCategory(category);
  const index = Math.floor(random() * pool.length);

  return pool[Math.min(index, pool.length - 1)];
}
