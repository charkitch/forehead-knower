export type Word = {
  word: string;
  tabooWords: string[];
};

export type Theme = {
  id: string;
  name: string;
  description: string;
  words: Word[];
};
