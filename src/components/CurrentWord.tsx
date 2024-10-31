interface CurrentWordProps {
  word: string;
  spoilerWords?: string[];
  showSpoilerWords: boolean;
  currentWordNumber?: number;
  totalWords?: number;
}

export function CurrentWord({
  word,
  spoilerWords,
  showSpoilerWords,
  currentWordNumber,
  totalWords,
}: CurrentWordProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 text-center w-full max-w-xs mx-auto">
      {currentWordNumber && totalWords && (
        <p className="text-gray-600 mb-2">
          Word {currentWordNumber} of {totalWords}
        </p>
      )}
      <h2 className="text-3xl font-bold mb-4">{word}</h2>
      {showSpoilerWords && spoilerWords && (
        <div className="space-y-2">
          <p className="font-semibold mb-2">Don't say:</p>
          <div className="flex flex-wrap gap-2">
            {spoilerWords.map((spoiler, index) => (
              <div
                key={index}
                className="bg-gray-100 p-2 rounded text-center flex-1 basis-[calc(50%-4px)]"
              >
                {spoiler}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentWord;
