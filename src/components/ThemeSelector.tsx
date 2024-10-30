import { defaultThemes } from "@/data/themes";
import type { Theme } from "@/types/game";

interface ThemeSelectorProps {
  selectedTheme: Theme | null;
  onThemeChange: (theme: Theme | null) => void;
}

export function ThemeSelector({
  selectedTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Select Theme:</label>
      <select
        value={selectedTheme?.id || ""}
        onChange={(e) => {
          const theme = defaultThemes.find((t) => t.id === e.target.value);
          onThemeChange(theme || null);
        }}
        className="w-full p-2 border rounded"
      >
        <option value="">Choose a theme...</option>
        {defaultThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
      {selectedTheme && (
        <p className="text-sm text-gray-600">{selectedTheme.description}</p>
      )}
    </div>
  );
}
