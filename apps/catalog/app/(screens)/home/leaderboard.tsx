"use client";

import { Avatar, SegmentedControl } from "@lance-live/gallery-ui";

export type Range = "7d" | "14d";

const RANGES = [
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
];

const PLACES = ["1st", "2nd", "3rd"];

/** The window a leaderboard counts over. It sits in the widget head and swaps the rows. */
export function RangeSegments({ value, onChange }: { value: Range; onChange: (next: Range) => void }) {
  return <SegmentedControl aria-label="Range" className="home-range" value={value} onValueChange={(next) => onChange(next as Range)} options={RANGES} />;
}

/** A place past the podium, as the row's lead. */
export function Rank({ place }: { place: number }) {
  return (
    <span className="home-rank" aria-label={`Rank ${place}`}>
      {place}
    </span>
  );
}

export type Placed = { id: string; name: string; initials: string; score: string };

/** The top three on steps, second, first, third from the left. First stands tallest, with the larger picture. */
export function Podium({ top }: { top: Placed[] }) {
  return (
    <ol className="home-podium">
      {top.slice(0, 3).map((person, index) => (
        <li key={person.id} className={`home-podium-place is-${index + 1}`}>
          <Avatar initials={person.initials} size={index === 0 ? "lg" : "md"} />
          <span className="home-podium-name">{person.name}</span>
          <span className="home-podium-score">{person.score}</span>
          <span className="home-podium-step" aria-label={`${PLACES[index]} place`}>
            {PLACES[index]}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** First and last initial, or the first two letters of a single name. */
export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
}
