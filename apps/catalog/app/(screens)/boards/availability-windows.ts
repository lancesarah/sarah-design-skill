type Window = { start: string; end: string };
const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export function windowError(windows: Window[]) {
  const intervals: [number, number][] = [];
  for (const window of windows) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(window.start) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(window.end)) return "Enter a start and end time for each window.";
    const start = minute(window.start), end = minute(window.end);
    if (start === end) return "Start and end times must be different.";
    if (end > start) intervals.push([start, end]);
    else intervals.push([start, 1440], [0, end]);
  }
  intervals.sort((a, b) => a[0] - b[0]);
  return intervals.some((range, index) => index > 0 && range[0] < intervals[index - 1][1]) ? "Time windows overlap. Adjust the start or end time." : "";
}
