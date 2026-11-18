import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HousekeeperSettings } from "../../../../apps/catalog/app/(screens)/boards/housekeeper-settings";
import { STAFF } from "../../../../apps/catalog/app/(screens)/boards/data";

describe("Housekeeper settings hierarchy", () => {
  it("separates area headings from subsections while preserving room-range and day choices", () => {
    const change = vi.fn();
    render(<HousekeeperSettings person={STAFF[0]} onChange={change} onOffboard={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Work preferences", level: 2 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Schedule preferences", level: 2 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Assignments", level: 3 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Days off", level: 3 })).toBeVisible();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Preferred section end" }), { target: { value: "320" } });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Preferred section end" }));
    expect(change).toHaveBeenLastCalledWith({ prefer: [301, 320] });
    fireEvent.click(screen.getByRole("button", { name: "Mon" }));
    expect(change).toHaveBeenLastCalledWith({ preferences: { daysOff: ["Mon"] } });
    fireEvent.click(screen.getByRole("button", { name: "Acknowledge" }));
    expect(change).toHaveBeenLastCalledWith({ preferences: expect.objectContaining({ derivedAcknowledged: expect.any(String) }) });
  });
});
