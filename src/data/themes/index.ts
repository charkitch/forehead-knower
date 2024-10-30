import { Theme } from "@/types/game";

const themeModules = import.meta.glob<Theme>("./defaults/*.json", {
  eager: true,
  import: "default",
});

// Validate that each theme has required properties
const validateTheme = (theme: unknown): theme is Theme => {
  const t = theme as Theme;
  return Boolean(
    t &&
      typeof t.id === "string" &&
      typeof t.name === "string" &&
      typeof t.description === "string" &&
      Array.isArray(t.words) &&
      t.words.every((w) => typeof w.word === "string"),
  );
};

export const defaultThemes: Theme[] =
  Object.values(themeModules).filter(validateTheme);
