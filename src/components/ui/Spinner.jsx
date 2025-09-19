export function Spinner({ label = "Chargement..." }) {
  return (
    <div
      className="flex min-h-[160px] items-center justify-center p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="flex items-center gap-3 text-sm text-foreground/70">
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground"
        />
        <span>{label}</span>
      </span>
    </div>
  );
}

export default Spinner;
