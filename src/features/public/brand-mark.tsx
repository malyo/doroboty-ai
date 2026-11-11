// Working brand sign from the Instrument favicon: ink square, square corners, one orange dot.
// It is a brand mark, not an interface element, so the dot does not break "orange = action".
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-8 place-items-center bg-[var(--ink)] ${className}`}
    >
      <span className="block size-[15px] rounded-full bg-[var(--action)]" />
    </span>
  );
}
