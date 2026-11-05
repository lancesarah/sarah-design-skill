export type LineGroup = "coins" | "bills" | "other";

export type CashLine = {
  id: string;
  label: string;
  /** Wording on the count, when the settings label differs. */
  countLabel?: string;
  group: LineGroup;
  kind: "count" | "amount";
  /** Dollars per piece. Amount lines are already dollars. */
  unit: number;
  /** Shown on every count even when the box is unchecked. */
  always?: boolean;
  on: boolean;
};

export type CashShift = {
  id: string;
  name: string;
  on: boolean;
};

export type CashLocation = {
  id: string;
  name: string;
  department: DepartmentName | null;
  expected: number;
  archived: boolean;
  shifts: CashShift[];
  lines: CashLine[];
};

export type DepartmentName =
  | "Front desk"
  | "Housekeeping"
  | "Maintenance"
  | "Food & Beverage"
  | "Sales"
  | "Management";

export type CashCount = {
  id: string;
  locationId: string;
  shift: string;
  by: string;
  initials: string;
  when: string;
  notes: string;
  /** Expected bank at the time of the count. Later location edits do not rewrite it. */
  expected: number;
  /** Dollar amount per line. Null when this count was not itemized. */
  entry: Record<string, number> | null;
  /** Used when `entry` is null. */
  total: number;
};

export const SHIFT_ORDER = ["AM In", "AM Out", "PM In", "PM Out", "NA In", "NA Out"];

const SUMMARY_ORDER = [
  "pennies",
  "nickels",
  "till",
  "dimes",
  "quarters",
  "drop",
  "rolled",
  "1",
  "5",
  "10",
  "20",
  "50",
  "100",
  "checks",
  "paid",
];

export function cents(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatMoney(value: number) {
  const amount = cents(value);
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function varianceLabel(delta: number) {
  const amount = cents(delta);
  if (amount === 0) return "even";
  return `${amount > 0 ? "+" : ""}${formatMoney(amount)}`;
}

export function totalOf(count: CashCount) {
  if (!count.entry) return cents(count.total);
  return cents(Object.values(count.entry).reduce((sum, value) => sum + value, 0));
}

export function varianceOf(count: CashCount) {
  return cents(totalOf(count) - count.expected);
}

export function shiftLabel(name: string) {
  return name.toUpperCase();
}

export function sortShifts(names: string[]) {
  return [...names].sort((a, b) => {
    const ai = SHIFT_ORDER.indexOf(a);
    const bi = SHIFT_ORDER.indexOf(b);
    const ar = ai === -1 ? SHIFT_ORDER.length : ai;
    const br = bi === -1 ? SHIFT_ORDER.length : bi;
    if (ar !== br) return ar - br;
    return a.localeCompare(b);
  });
}

export function enabledShifts(location: CashLocation) {
  return sortShifts(location.shifts.filter((shift) => shift.on).map((shift) => shift.name));
}

export function countLines(location: CashLocation) {
  return location.lines.filter((line) => line.on || line.always);
}

export function includedLineCount(location: CashLocation) {
  return countLines(location).length;
}

export function formatWhen(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function summaryLines(location: CashLocation, entry: Record<string, number> | null) {
  if (!entry) return [];
  const byId = new Map(location.lines.map((line) => [line.id, line]));
  const ordered = [
    ...SUMMARY_ORDER.filter((id) => byId.has(id)),
    ...location.lines.map((line) => line.id).filter((id) => !SUMMARY_ORDER.includes(id)),
  ];
  return ordered.flatMap((id) => {
    const line = byId.get(id);
    if (!line) return [];
    const amount = cents(entry[id] ?? 0);
    if (amount === 0 && !line.always) return [];
    return [{ line, amount }];
  });
}

export function dollarsFromInput(line: CashLine, raw: string, mode: "count" | "amount") {
  const value = Number(raw);
  if (!raw.trim() || Number.isNaN(value)) return 0;
  if (mode === "amount" || line.kind === "amount") return cents(value);
  return cents(value * line.unit);
}

export function inputFromDollars(line: CashLine, dollars: number, mode: "count" | "amount") {
  if (!dollars) return "";
  if (mode === "count" && line.kind === "count") {
    return String(Math.round(dollars / line.unit));
  }
  return cents(dollars).toFixed(2);
}

function line(partial: CashLine): CashLine {
  return partial;
}

export function defaultLines(): CashLine[] {
  return [
    line({ id: "pennies", label: "Pennies", group: "coins", kind: "count", unit: 0.01, on: true }),
    line({ id: "nickels", label: "Nickels", group: "coins", kind: "count", unit: 0.05, on: true }),
    line({ id: "dimes", label: "Dimes", group: "coins", kind: "count", unit: 0.1, on: true }),
    line({ id: "quarters", label: "Quarters", group: "coins", kind: "count", unit: 0.25, on: true }),
    line({ id: "rolled", label: "Rolled coins", group: "coins", kind: "amount", unit: 1, on: true }),
    line({ id: "1", label: "$1 bills", group: "bills", kind: "count", unit: 1, on: true }),
    line({ id: "5", label: "$5 bills", group: "bills", kind: "count", unit: 5, on: true }),
    line({ id: "10", label: "$10 bills", group: "bills", kind: "count", unit: 10, on: true }),
    line({ id: "20", label: "$20 bills", group: "bills", kind: "count", unit: 20, on: true }),
    line({ id: "50", label: "$50 bills", group: "bills", kind: "count", unit: 50, on: true }),
    line({ id: "100", label: "$100 bills", group: "bills", kind: "count", unit: 100, on: true }),
    line({ id: "checks", label: "Checks", group: "other", kind: "amount", unit: 1, on: true }),
    line({ id: "paid", label: "Paid outs", group: "other", kind: "amount", unit: 1, on: true }),
    line({
      id: "drop",
      label: "Deposit/drop",
      countLabel: "Deposit / drop",
      group: "other",
      kind: "amount",
      unit: 1,
      always: true,
      on: false,
    }),
    line({ id: "till", label: "Bank till", group: "other", kind: "amount", unit: 1, always: true, on: false }),
  ];
}

export function defaultShifts(): CashShift[] {
  return SHIFT_ORDER.map((name) => ({ id: name, name, on: true }));
}

export function createLocation(id: string): CashLocation {
  return {
    id,
    name: "",
    department: null,
    expected: 0,
    archived: false,
    shifts: SHIFT_ORDER.map((name) => ({ id: name, name, on: false })),
    lines: defaultLines(),
  };
}

export const INITIAL_LOCATIONS: CashLocation[] = [
  {
    id: "front-desk",
    name: "Front Desk",
    department: "Front desk",
    expected: 0,
    archived: false,
    shifts: defaultShifts(),
    lines: defaultLines(),
  },
];

export const INITIAL_COUNTS: CashCount[] = [
  {
    id: "pm-out",
    locationId: "front-desk",
    shift: "PM Out",
    by: "Ddroo636",
    initials: "DD",
    when: "Nov 4, 11:24 PM",
    notes: "",
    expected: 0,
    total: 300,
    entry: {
      pennies: 0.15,
      nickels: 0.4,
      dimes: 0.2,
      quarters: 7.25,
      rolled: 9,
      "1": 23,
      "5": 80,
      "10": 40,
      "20": 140,
    },
  },
  {
    id: "pm-in",
    locationId: "front-desk",
    shift: "PM In",
    by: "Ddroo636",
    initials: "DD",
    when: "Nov 4, 4:53 PM",
    notes: "",
    expected: 424.79,
    total: 424.79,
    entry: null,
  },
  {
    id: "am-out",
    locationId: "front-desk",
    shift: "AM Out",
    by: "Kiet Le",
    initials: "KL",
    when: "Nov 4, 2:38 PM",
    notes: "",
    expected: 0,
    total: 300,
    entry: null,
  },
  {
    id: "am-in",
    locationId: "front-desk",
    shift: "AM In",
    by: "Lea Tuapati",
    initials: "LT",
    when: "Nov 4, 9:03 AM",
    notes: "",
    expected: 0,
    total: 300,
    entry: null,
  },
];
