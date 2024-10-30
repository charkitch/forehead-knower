interface TabooWordsCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TabooWordsCheckbox({
  checked,
  onChange,
}: TabooWordsCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" id="taboo" checked={checked} onChange={onChange} />
      <label htmlFor="taboo">Show forbidden words</label>
    </div>
  );
}
