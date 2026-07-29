import { useState } from 'react';

interface Props {
  className?: string;
}

// Renders /logo.jpg, falling back to a monogram if the file isn't present yet.
export default function Logo({ className = 'h-10 w-10' }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`grid place-items-center rounded-full bg-ink font-serif font-semibold text-white ${className}`}
      >
        J
      </span>
    );
  }

  return (
    <img
      src="/logo.jpg"
      alt="Jasmine Cosmetics"
      onError={() => setFailed(true)}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
