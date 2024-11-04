import { useState } from "react";
import { useMotionControls } from "@/utils/useMotionControls";
import type { Theme, Word } from "@/types/game";

import { GameControls } from "@/components/GameControls";
import { MotionControls } from "@/components/MotionControls";
import { ThemeSelector } from "@/components/ThemeSelector";
import { GameProgress } from "@/components/GameProgress";
import { CurrentWord } from "@/components/CurrentWord";
import { StartGameButton } from "@/components/StartGameButton";
import { SpoilerWordsCheckbox } from "@/components/SpoilerWordsCheckbox";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { ScoreboardModal } from "@/components/ScoreboardModal";

export default function Game() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">(
    "ready",
  );
  const [showSpoilerWords, setShowSpoilerWords] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wordResults, setWordResults] = useState<("correct" | "incorrect")[]>(
    [],
  );

  const getCurrentWord = (): Word | null => {
    if (currentWords.length === 0 || currentWordIndex >= currentWords.length) {
      return null;
    }
    return currentWords[currentWordIndex] ?? null;
  };

  const TWO_SECONDS = 2000;

  const handleCorrect = () => {
    if (feedback) return;
    setFeedback("Correct!");
    setWordResults((prev) => [...prev, "correct"]);

    setTimeout(() => {
      setFeedback(null);
      if (currentWordIndex === currentWords.length - 1) {
        setGameState("finished");
      } else {
        setCurrentWordIndex((i) => i + 1);
      }
    }, TWO_SECONDS);
  };

  const handleIncorrect = () => {
    if (feedback) return;
    setFeedback("Incorrect!");
    setWordResults((prev) => [...prev, "incorrect"]);

    setTimeout(() => {
      setFeedback(null);
      if (currentWordIndex === currentWords.length - 1) {
        setGameState("finished");
      } else {
        setCurrentWordIndex((i) => i + 1);
      }
    }, TWO_SECONDS);
  };

  const { isMotionEnabled, requestMotionPermission, calibrateOrientation } =
    useMotionControls({
      onFlipUp: handleCorrect,
      onFlipDown: handleIncorrect,
      enabled: gameState === "playing",
    });

  const startGame = () => {
    if (!selectedTheme) return;

    const shuffled = [...selectedTheme.words]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    setCurrentWords(shuffled);
    setCurrentWordIndex(0);
    setWordResults([]);
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
          spoilerWords={currentWord.spoilerWords}
          showSpoilerWords={showSpoilerWords}
        />

        <GameControls onSkip={handleIncorrect} onCorrect={handleCorrect} />

        {feedback && <FeedbackMessage message={feedback} />}
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

          <SpoilerWordsCheckbox
            checked={showSpoilerWords}
            onChange={(e) => setShowSpoilerWords(e.target.checked)}
          />

          <StartGameButton onClick={startGame} disabled={!selectedTheme} />
        </div>
      )}
      {gameState === "playing" && renderGameContent()}

      {gameState === "finished" && (
        <ScoreboardModal
          words={currentWords}
          results={wordResults}
          onClose={() => setGameState("ready")}
        />
      )}
    </div>
  );
}
