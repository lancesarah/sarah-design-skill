import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsToggleRow, SettingsInputRow } from "./SettingsCard";

describe("Settings rows", () => {
  it("toggles once from the label or switch, and leaves the info action separate", () => {
    const change = vi.fn();
    const info = vi.fn();
    render(<SettingsToggleRow label="Training" value={false} onValueChange={change} info={<button onClick={info}>About training</button>} />);
    fireEvent.click(screen.getByText("Training", { selector: ".settings-row-label" }));
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Training" }));
    expect(change).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "About training" }));
    expect(info).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(2);
  });
  it("preserves the input label, value, and native constraints", () => {
    const change = vi.fn();
    render(<SettingsInputRow label="Room limit" input={{ type: "number", min: 1, value: 15, onChange: change }} />);
    const input = screen.getByRole("spinbutton", { name: "Room limit" });
    expect(input).toHaveValue(15);
    expect(input).toHaveAttribute("min", "1");
    fireEvent.change(input, { target: { value: "12" } });
    expect(change).toHaveBeenCalledTimes(1);
  });
});
