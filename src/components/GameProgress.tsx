interface GameProgressProps {
  currentIndex: number;
  total: number;
}

export function GameProgress({ currentIndex, total }: GameProgressProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-lg">
        Word {currentIndex + 1} of {total}
      </span>
    </div>
  );
}
