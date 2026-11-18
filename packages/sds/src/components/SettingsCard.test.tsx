import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsToggleRow, SettingsInputRow, SettingsRow, SettingsCard, SectionHeader } from "./SettingsCard";

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
  it("keeps the described heading outside the group and custom choices independently interactive", () => {
    const light = vi.fn();
    const dark = vi.fn();
    render(<><SectionHeader variant="described" title="Appearance" description="Choose a theme." />
      <SectionHeader level={3} title="Display preferences" /><SettingsCard label="Appearance"><SettingsRow layout="stacked" label="Theme" description="Applies in this browser.">
        <button onClick={light}>Light</button><button onClick={dark}>Dark</button>
      </SettingsRow></SettingsCard></>);
    expect(screen.getByRole("group", { name: "Appearance" })).not.toContainElement(screen.getByRole("heading", { name: "Appearance" }));
    expect(screen.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Display preferences", level: 3 })).toBeVisible();
    expect(screen.getByRole("group", { name: "Theme" })).toHaveTextContent("Applies in this browser.");
    fireEvent.click(screen.getByText("Theme", { selector: ".settings-row-label" }));
    expect(light).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(dark).toHaveBeenCalledTimes(1);
    expect(light).not.toHaveBeenCalled();
  });

});
