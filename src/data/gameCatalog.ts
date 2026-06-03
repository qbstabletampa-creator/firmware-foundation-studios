export interface GameEntry {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  route: string;
  appRoute: string;
  status: "released" | "coming-soon";
  price: string;
  category: string;
  ageRating: string;
  features: string[];
  screenshots: string[];
  stripeUrl: string;
  accentEmoji: string;
}

export const games: GameEntry[] = [
  {
    id: "gosple",
    title: "Gosple",
    tagline: "A daily Bible word puzzle for the whole family",
    description:
      "Solve a new faith-inspired word puzzle every day. Each answer reveals a Bible verse and reflection prompt. Build your streak, earn badges, and grow in the Word together.",
    icon: "/gosple-icon.png",
    route: "/gosple",
    appRoute: "/gosple/app",
    status: "released",
    price: "Free",
    category: "Word Puzzle",
    ageRating: "Ages 6+",
    features: [
      "New puzzle every day",
      "Bible verse with every answer",
      "Streak tracking and badges",
      "Kid and parent profiles",
      "3 free plays to try",
    ],
    screenshots: [
      "/screenshots/gosple-1.png",
      "/screenshots/gosple-2.png",
      "/screenshots/gosple-3.png",
      "/screenshots/gosple-4.png",
      "/screenshots/gosple-5.png",
    ],
    stripeUrl: "https://buy.stripe.com/6oUfZb4B66Wv1kL6eLeEo0o",
    accentEmoji: "📖",
  },
  {
    id: "manna-catch",
    title: "Manna Catch",
    tagline: "Catch the blessings from heaven",
    description:
      "Guide your basket to catch manna falling from heaven. Dodge thorns and stones, grab power-ups, and build your longest combo. Every 50 points reveals a new Bible verse. How long can you keep the faith?",
    icon: "/manna-catch-icon.png",
    route: "/manna-catch",
    appRoute: "/manna-catch/app",
    status: "released",
    price: "Free",
    category: "Arcade",
    ageRating: "Ages 4+",
    features: [
      "Daily seeded challenges",
      "3 power-ups: Wide Basket, Slow-Mo, Magnet",
      "Bible verse every 50 points",
      "20 faith-themed badges",
      "Rising difficulty that keeps you coming back",
      "1 free play per day",
    ],
    screenshots: [],
    stripeUrl: "https://buy.stripe.com/28EeV7gjO4One7x8mTeEo0p",
    accentEmoji: "🍞",
  },
  {
    id: "noah-animal-match",
    title: "Noah Animal Match",
    tagline: "Match animals two by two",
    description:
      "Flip cards to find matching animal pairs, just like Noah gathered them two by two. Progress through levels, earn stars, and unlock Bible verses along the way.",
    icon: "/noah-animal-match-icon.png",
    route: "/noah-animal-match",
    appRoute: "/noah-animal-match/app",
    status: "released",
    price: "Free",
    category: "Puzzle",
    ageRating: "Ages 4+",
    features: [
      "Match animals two by two",
      "5 progressive levels",
      "Bible verse rewards",
      "20 faith-themed badges",
      "3 free games to try",
    ],
    screenshots: [],
    stripeUrl: "",
    accentEmoji: "🦁",
  },
  {
    id: "ark-hopper",
    title: "Ark Hopper",
    tagline: "Help them reach the Ark!",
    description:
      "Guide animals across rivers, roads, and fields to reach Noah's Ark. Dodge sheep, ride logs, and collect stars in this gentle, fun adventure.",
    icon: "/ark-hopper-icon.png",
    route: "/ark-hopper",
    appRoute: "/ark-hopper/app",
    status: "released",
    price: "Free",
    category: "Arcade",
    ageRating: "Ages 4+",
    features: [
      "Frogger-style hopping fun",
      "5 unlockable animal characters",
      "Bible verse rewards",
      "20 faith-themed badges",
      "1 free game per day",
    ],
    screenshots: [],
    stripeUrl: "",
    accentEmoji: "🐑",
  },
];

export function getGame(id: string): GameEntry | undefined {
  return games.find((game) => game.id === id);
}
