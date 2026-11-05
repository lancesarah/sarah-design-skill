export function Glyph({ name, size = 14, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg className={className ? `i ${className}` : "i"} width={size} height={size} aria-hidden="true">
      <use href={`/icons.svg#i-${name}`} />
    </svg>
  );
}
