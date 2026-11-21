import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker, parseTime, formatTime } from "./TimePicker";

describe("TimePicker", () => {
  it("handles noon, midnight, exact minutes, and invalid times", () => {
    expect(parseTime("12:00AM")).toBe("00:00");
    expect(parseTime("12:00PM")).toBe("12:00");
    expect(parseTime("9:17 pm")).toBe("21:17");
    expect(parseTime("23:59")).toBe("23:59");
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("9:60AM")).toBeNull();
    expect(formatTime("00:00")).toBe("12:00AM");
  });
  it("edits each part while preserving the other part", () => {
    const change = vi.fn();
    render(<TimePicker label="Start" value="09:17" onValueChange={change} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Start — hour" }), { target: { value: "22" } });
    expect(change).toHaveBeenLastCalledWith("22:17");
    fireEvent.change(screen.getByRole("combobox", { name: "Start — minute" }), { target: { value: "31" } });
    expect(change).toHaveBeenLastCalledWith("09:31");
  });
  it("restricts choices to the allowed times", () => {
    render(<TimePicker label="End" value="17:15" min="17:15" max="17:45" step={900} required onValueChange={vi.fn()} />);
    const minutes = screen.getByRole("combobox", { name: "End — minute" }) as HTMLSelectElement;
    expect(Array.from(minutes.options, option => option.value)).toEqual(["", "15", "30", "45"]);
    expect(minutes.options[0].disabled).toBe(true);
  });
});
