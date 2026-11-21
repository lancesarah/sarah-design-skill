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
    fireEvent.click(screen.getByRole("switch", { name: "Training" }));
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

  it("delegates a native single-switch row once, including inside a form", () => {
    const change = vi.fn();
    render(<SettingsRow label="Calls"><button role="switch" aria-checked="false" onClick={change}>Toggle calls</button><input type="checkbox" aria-hidden="true" tabIndex={-1} readOnly /></SettingsRow>);
    fireEvent.click(screen.getByText("Calls", { selector: ".settings-row-label" }));
    expect(change).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("switch", { name: "Toggle calls" }));
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("does not activate disabled toggles or choose between multiple actions", () => {
    const change = vi.fn();
    const view = render(<SettingsRow label="Locked"><button role="switch" aria-checked="false" disabled onClick={change}>Toggle locked</button></SettingsRow>);
    fireEvent.click(screen.getByText("Locked", { selector: ".settings-row-label" }));
    expect(change).not.toHaveBeenCalled();
    view.rerender(<SettingsRow label="Multiple"><button role="switch" aria-checked="false" onClick={change}>Toggle</button><button>Configure</button></SettingsRow>);
    fireEvent.click(screen.getByText("Multiple", { selector: ".settings-row-label" }));
    expect(change).not.toHaveBeenCalled();
  });
});


describe("Settings row delegation boundaries", () => {
  it("activates the sole action inside a focusable ancestor", () => {
    const action = vi.fn();
    render(<div role="tabpanel" tabIndex={0}><SettingsRow label="Edit routing"><button onClick={action}>Edit</button></SettingsRow></div>);
    fireEvent.click(screen.getByText("Edit routing"));
    expect(action).toHaveBeenCalledTimes(1);
  });
  it("focuses a text field without synthesizing a click", () => {
    const click = vi.fn();
    render(<SettingsRow label="Display name"><input aria-label="Display name field" onClick={click}/></SettingsRow>);
    fireEvent.click(screen.getByText("Display name"));
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(click).not.toHaveBeenCalled();
  });
  it("locks a busy toggle immediately", () => {
    const change = vi.fn();
    render(<SettingsToggleRow label="Pending" value={false} busy onValueChange={change}/>);
    expect(screen.getByRole("switch")).toBeDisabled();
    fireEvent.click(screen.getByText("Pending", { selector: ".settings-row-label" }));
    expect(change).not.toHaveBeenCalled();
  });
});
