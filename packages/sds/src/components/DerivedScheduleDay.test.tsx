import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DerivedScheduleDay } from "../../../../apps/catalog/app/(screens)/boards/derived-schedule-day";

afterEach(() => vi.restoreAllMocks());
describe("Derived schedule dropdown", () => {
  it.each(["off", "clear"] as const)("provides the %s action for a working day", action => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ x: 10, y: 10, top: 10, left: 10, right: 100, bottom: 60, width: 90, height: 50, toJSON: () => ({}) });
    const change = vi.fn();
    render(<DerivedScheduleDay day="Thu" shift={{ start: "08:00", end: "16:30" }} cleared={false} onAction={change} />);
    fireEvent.click(screen.getByRole("button", { name: /Thu/ }));
    expect(screen.getByRole("menu", { name: "Thursday schedule" })).toBeVisible();
    fireEvent.click(screen.getByRole("menuitem", { name: action === "off" ? "Mark as day off" : "Clear typical shift" }));
    expect(change).toHaveBeenCalledWith(action);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
  it("offers working day for an off day", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ x: 10, y: 10, top: 10, left: 10, right: 100, bottom: 60, width: 90, height: 50, toJSON: () => ({}) });
    const change = vi.fn();
    render(<DerivedScheduleDay day="Mon" cleared={false} onAction={change} />);
    fireEvent.click(screen.getByRole("button", { name: /Mon/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Mark as working day" }));
    expect(change).toHaveBeenCalledWith("working");
  });
});
