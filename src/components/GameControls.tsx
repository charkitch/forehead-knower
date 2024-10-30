import { ChevronUp, ChevronDown } from "lucide-react";

interface GameControlsProps {
  onSkip: () => void;
  onCorrect: () => void;
}

export function GameControls({ onSkip, onCorrect }: GameControlsProps) {
  return (
    <div className="flex gap-4">
      <button
        className="flex-1 bg-red-500 text-white rounded-lg p-4 flex items-center justify-center"
        onClick={onSkip}
      >
        <ChevronDown className="w-6 h-6" />
        <span className="ml-2">Wrong</span>
      </button>
      <button
        className="flex-1 bg-green-500 text-white rounded-lg p-4 flex items-center justify-center"
        onClick={onCorrect}
      >
        <ChevronUp className="w-6 h-6" />
        <span className="ml-2">Correct</span>
      </button>
    </div>
  );
}
