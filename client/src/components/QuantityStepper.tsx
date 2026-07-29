import { MinusIcon, PlusIcon } from './icons';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export default function QuantityStepper({ value, onChange, min = 1 }: Props) {
  return (
    <div className="inline-flex items-center rounded-full border border-pink-soft">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-10 w-10 place-items-center text-pink-deep hover:bg-pink-light rounded-l-full"
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-10 w-10 place-items-center text-pink-deep hover:bg-pink-light rounded-r-full"
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
