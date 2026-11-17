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
  it("commits typed times and retains invalid drafts without changing the saved value", () => {
    const change = vi.fn();
    render(<TimePicker label="Start" value="09:00" onValueChange={change} />);
    const field = screen.getByRole("textbox", { name: "Start" });
    fireEvent.change(field, { target: { value: "10:17PM" } });
    fireEvent.blur(field);
    expect(change).toHaveBeenLastCalledWith("22:17");
    fireEvent.change(field, { target: { value: "25:00" } });
    fireEvent.blur(field);
    expect(change).toHaveBeenCalledTimes(1);
    expect(field).toHaveAttribute("aria-invalid", "true");
  });
  it("selects a suggestion and dismisses the menu", () => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    const bounds = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 32, width: 200, height: 32, toJSON: () => ({}) });
    const change = vi.fn();
    render(<TimePicker label="End" value="17:00" onValueChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose End" }));
    const selected = screen.getByRole("menuitemradio", { name: "5:00PM" });
    expect(selected).toHaveFocus();
    fireEvent.keyDown(selected, { key: "ArrowDown" });
    expect(screen.getByRole("menuitemradio", { name: "5:30PM" })).toHaveFocus();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "5:30PM" }));
    expect(change).toHaveBeenCalledWith("17:30");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    bounds.mockRestore();
  });
});
