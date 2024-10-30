import { useState } from "react";
import { useMotionControls } from "@/utils/useMotionControls";
import type { Theme, Word } from "@/types/game";

import { GameControls } from "@/components/GameControls";
import { MotionControls } from "@/components/MotionControls";
import { ThemeSelector } from "@/components/ThemeSelector";
import { GameProgress } from "@/components/GameProgress";
import { CurrentWord } from "@/components/CurrentWord";
import { StartGameButton } from "@/components/StartGameButton";
import { TabooWordsCheckbox } from "@/components/TabooWordsCheckbox";

export default function Game() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">(
    "ready",
  );
  const [showTabooWords, setShowTabooWords] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const getCurrentWord = (): Word | null => {
    if (currentWords.length === 0 || currentWordIndex >= currentWords.length) {
      return null;
    }
    return currentWords[currentWordIndex] ?? null;
  };
  const handleCorrect = () => {
    setCurrentWordIndex((i) => (i + 1) % currentWords.length);
  };

  const handleSkip = () => {
    setCurrentWordIndex((i) => (i + 1) % currentWords.length);
  };

  const { isMotionEnabled, requestMotionPermission, calibrateOrientation } =
    useMotionControls({
      onFlipUp: handleCorrect,
      onFlipDown: handleSkip,
      enabled: gameState === "playing",
    });

  const startGame = () => {
    if (!selectedTheme) return;

    const shuffled = [...selectedTheme.words]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    setCurrentWords(shuffled);
    setCurrentWordIndex(0);
    setGameState("playing");

    if (isMotionEnabled) {
      calibrateOrientation();
    }
  };

  const renderGameContent = () => {
    const currentWord = getCurrentWord();

    if (!currentWord) {
      return null;
    }

    return (
      <div className="space-y-4">
        <GameProgress
          currentIndex={currentWordIndex}
          total={currentWords.length}
        />

        <CurrentWord
          word={currentWord.word}
          tabooWords={currentWord.tabooWords}
          showTabooWords={showTabooWords}
        />

        <GameControls onSkip={handleSkip} onCorrect={handleCorrect} />
      </div>
    );
  };

  return (
    <div className="p-4">
      {gameState === "ready" && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Forehead Game</h1>

          <MotionControls
            isEnabled={isMotionEnabled}
            onEnable={requestMotionPermission}
            onCalibrate={calibrateOrientation}
          />

          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />

          <TabooWordsCheckbox
            checked={showTabooWords}
            onChange={(e) => setShowTabooWords(e.target.checked)}
          />

          <StartGameButton onClick={startGame} disabled={!selectedTheme} />
        </div>
      )}

      {gameState === "playing" && renderGameContent()}
    </div>
  );
}
