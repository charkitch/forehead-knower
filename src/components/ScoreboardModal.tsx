import { BasicModal } from "@/components/BasicModal";

interface ScoreboardModalProps {
  words: Array<{ word: string }>;
  results: ("correct" | "incorrect")[];
  onClose: () => void;
}

export const ScoreboardModal = ({
  words,
  results,
  onClose,
}: ScoreboardModalProps) => {
  const correctCount = results.filter((result) => result === "correct").length;
  const score = Math.round((correctCount / results.length) * 100);

  return (
    <BasicModal>
      <div className="space-y-6 max-w-md">
        <h2 className="text-2xl font-bold text-center">Game Results</h2>

        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 mb-2">{score}%</div>
          <div className="text-sm text-gray-500">
            {correctCount} correct out of {results.length} words
          </div>
        </div>

        <div className="space-y-2">
          {words.map((word, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <span className="font-medium">{word.word}</span>
              <span
                className={
                  results[index] === "correct"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {results[index] === "correct" ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    </BasicModal>
  );
};
