interface StartGameButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function StartGameButton({ onClick, disabled }: StartGameButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 
               disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Start Game
    </button>
  );
}
