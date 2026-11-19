import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddOptionField } from "../add-option";

describe("AddOptionField", () => {
  it("adds once on Enter without submitting the surrounding form", () => {
    const onAdd = vi.fn();
    render(<form><AddOptionField label="New option" value="Pool" onValueChange={() => {}} onAdd={onAdd} addLabel="Add" /></form>);
    const enter = createEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", cancelable: true });
    fireEvent(screen.getByRole("textbox"), enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("keeps blank and disabled entries from adding", () => {
    const onAdd = vi.fn();
    const { rerender } = render(<AddOptionField label="New option" value="  " onValueChange={() => {}} onAdd={onAdd} addLabel="Add" />);
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onAdd).not.toHaveBeenCalled();
    rerender(<AddOptionField label="New option" value="Pool" disabled onValueChange={() => {}} onAdd={onAdd} addLabel="Add" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("preserves composition and passes typed input to its consumer", () => {
    const onAdd = vi.fn();
    const onValueChange = vi.fn();
    render(<AddOptionField label="New option" value="Pool" onValueChange={onValueChange} onAdd={onAdd} addLabel="Add" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true });
    expect(onAdd).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Spa" } });
    expect(onValueChange).toHaveBeenCalledWith("Spa");
  });
});
