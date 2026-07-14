'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface TradeTypeOption<T extends string> {
  value: T;
  label: string;
}

interface TradeTypeChipsProps<T extends string> {
  value: T;
  options: TradeTypeOption<T>[];
  onValueChange: (value: T) => void;
}

export function TradeTypeChips<T extends string>({
  value,
  options,
  onValueChange,
}: TradeTypeChipsProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        // Use options lookup so onValueChange receives the correctly-typed T value
        const opt = options.find((o) => o.value === v);
        if (opt) onValueChange(opt.value);
      }}
      className="w-fit gap-2"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className="rounded-full border border-border bg-card/50 px-4 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:bg-muted hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:font-semibold data-[state=on]:text-primary-foreground data-[state=on]:shadow-glow"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
