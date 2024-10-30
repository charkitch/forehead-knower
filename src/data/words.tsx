export interface Word {
  word: string;
  tabooWords?: string[];
  theme: string;
}

export const themes = [
  { id: "movies", name: "Movies" },
  { id: "animals", name: "Animals" },
  { id: "food", name: "Food & Drinks" },
] as const;

export const words: Word[] = [
  {
    word: "Lion King",
    tabooWords: ["Simba", "Mufasa", "Disney", "Pride Rock", "Hakuna Matata"],
    theme: "movies",
  },
  {
    word: "Elephant",
    tabooWords: ["Trunk", "Gray", "Big", "Safari", "Tusks"],
    theme: "animals",
  },
  {
    word: "Pizza",
    tabooWords: ["Cheese", "Pepperoni", "Italy", "Crust", "Slice"],
    theme: "food",
  },
  // Add more words as needed...
];
