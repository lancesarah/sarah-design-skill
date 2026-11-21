import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Availability } from "../../../../apps/catalog/app/(screens)/boards/availability";

type AvailabilityValue = { [day: string]: { enabled: boolean; windows: { start: string; end: string }[] } };
function Example() {
  const [value, setValue] = useState<AvailabilityValue>({ Mon: { enabled: true, windows: [{ start: "09:00", end: "17:00" }] } });
  return <Availability value={value} onChange={next => setValue(next as AvailabilityValue)} />;
}
describe("Availability reset", () => {
  it("opens an available day before a second click deselects it", () => {
    render(<Example />);
    const tuesday = screen.getByRole("tab", { name: /Tue/ });
    fireEvent.click(tuesday);
    expect(screen.getByRole("group", { name: "Tuesday window 1 start" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Available on Tuesday" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(tuesday);
    expect(screen.getByRole("checkbox", { name: "Available on Tuesday" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("group", { name: "Wednesday window 1 start" })).toBeVisible();
  });
  it("advances to the next available day and wraps after Sunday", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Available on Tuesday" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Available on Monday" }));
    expect(screen.getByRole("group", { name: "Wednesday window 1 start" })).toBeVisible();
    fireEvent.click(screen.getByRole("checkbox", { name: "Available on Sunday" }));
    expect(screen.getByRole("group", { name: "Wednesday window 1 start" })).toBeVisible();
    for (const day of ["Wednesday", "Thursday", "Friday", "Saturday"]) fireEvent.click(screen.getByRole("checkbox", { name: `Available on ${day}` }));
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("Select an available day to set its times.")).toBeVisible();
  });
  it.each(["tile", "checkbox"])("restores the default window after clearing and re-enabling with %s", method => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Monday window 1" }));
    expect(screen.queryByRole("group", { name: "Monday window 1 start" })).not.toBeInTheDocument();
    if (method === "tile") fireEvent.click(screen.getByRole("tab", { name: /Mon\s*Off/ }));
    if (method === "checkbox") fireEvent.click(screen.getByRole("checkbox", { name: "Available on Monday" }));
    expect(screen.getByRole("combobox", { name: "Monday window 1 start — hour" })).toHaveValue("09");
    expect(screen.getByRole("combobox", { name: "Monday window 1 start — minute" })).toHaveValue("00");
    expect(screen.getByRole("combobox", { name: "Monday window 1 end — hour" })).toHaveValue("17");
    expect(screen.getByRole("combobox", { name: "Monday window 1 end — minute" })).toHaveValue("00");
  });
});
