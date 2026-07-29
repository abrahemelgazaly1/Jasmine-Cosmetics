export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-light border-t-pink-accent" />
      {label && <p className="text-sm text-ink/50">{label}</p>}
    </div>
  );
}
