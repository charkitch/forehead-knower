interface CurrentWordProps {
  word: string;
  tabooWords?: string[];
  showTabooWords: boolean;
}

export function CurrentWord({
  word,
  tabooWords,
  showTabooWords,
}: CurrentWordProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">{word}</h2>
      {showTabooWords && tabooWords && (
        <div className="space-y-2">
          <p className="font-semibold">Don't say:</p>
          {tabooWords.map((taboo, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded">
              {taboo}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
