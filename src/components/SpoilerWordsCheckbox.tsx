interface SpoilerWordsCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SpoilerWordsCheckbox({
  checked,
  onChange,
}: SpoilerWordsCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="spoiler"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor="spoiler">Show forbidden words</label>
    </div>
  );
}
