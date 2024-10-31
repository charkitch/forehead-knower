export type Word = {
  word: string;
  spoilerWords: string[];
};

export type Theme = {
  id: string;
  name: string;
  description: string;
  words: Word[];
};
