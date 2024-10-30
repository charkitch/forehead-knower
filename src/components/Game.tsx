import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { defaultThemes } from "@/data/themes";
import type { Theme, Word } from "@/types/game";

export default function Game() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">(
    "ready",
  );
  const [showTabooWords, setShowTabooWords] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const startGame = () => {
    if (!selectedTheme) return;

    // Shuffle and select 8 random words from the theme
    const shuffled = [...selectedTheme.words]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    setCurrentWords(shuffled);
    setCurrentWordIndex(0);
    setGameState("playing");
  };

  return (
    <div className="p-4">
      {gameState === "ready" && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Forehead Game</h1>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="block font-medium">Select Theme:</label>
            <select
              value={selectedTheme?.id || ""}
              onChange={(e) => {
                const theme = defaultThemes.find(
                  (t) => t.id === e.target.value,
                );
                setSelectedTheme(theme || null);
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
              <p className="text-sm text-gray-600">
                {selectedTheme.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="taboo"
              checked={showTabooWords}
              onChange={(e) => setShowTabooWords(e.target.checked)}
            />
            <label htmlFor="taboo">Show forbidden words</label>
          </div>

          <button
            onClick={startGame}
            disabled={!selectedTheme}
            className="w-full bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === "playing" && currentWords.length > 0 && (
        <div className="space-y-4">
          {/* Game Progress */}
          <div className="flex justify-between items-center">
            <span className="text-lg">
              Word {currentWordIndex + 1} of {currentWords.length}
            </span>
          </div>

          {/* Current Word Display */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {currentWords[currentWordIndex].word}
            </h2>
            {showTabooWords && currentWords[currentWordIndex].tabooWords && (
              <div className="space-y-2">
                <p className="font-semibold">Don't say:</p>
                {currentWords[currentWordIndex].tabooWords.map(
                  (word, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      {word}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <button
              className="flex-1 bg-red-500 text-white rounded-lg p-4 flex items-center justify-center"
              onClick={() =>
                setCurrentWordIndex((i) => (i + 1) % currentWords.length)
              }
            >
              <ChevronDown className="w-6 h-6" />
              <span className="ml-2">Skip</span>
            </button>
            <button
              className="flex-1 bg-green-500 text-white rounded-lg p-4 flex items-center justify-center"
              onClick={() =>
                setCurrentWordIndex((i) => (i + 1) % currentWords.length)
              }
            >
              <ChevronUp className="w-6 h-6" />
              <span className="ml-2">Correct</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
