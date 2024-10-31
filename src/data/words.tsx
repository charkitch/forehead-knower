export interface Word {
  word: string;
  spoilerWords?: string[];
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
    spoilerWords: ["Simba", "Mufasa", "Disney", "Pride Rock", "Hakuna Matata"],
    theme: "movies",
  },
  {
    word: "Elephant",
    spoilerWords: ["Trunk", "Gray", "Big", "Safari", "Tusks"],
    theme: "animals",
  },
  {
    word: "Pizza",
    spoilerWords: ["Cheese", "Pepperoni", "Italy", "Crust", "Slice"],
    theme: "food",
  },
  // Add more words as needed...
];
