/** Shared Readings graph tooltip. The chart hover hook owns placement and visibility. */
export function ChartTooltip({ label, value }: { label: string; value: string }) {
  return <span className="tip readings-tip" role="tooltip" popover="manual">
    <span className="readings-tip-when">{label}</span>
    <strong>{value}</strong>
  </span>;
}
