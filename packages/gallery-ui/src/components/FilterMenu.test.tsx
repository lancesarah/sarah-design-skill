import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilterMenu, FilterSubmenu } from "./FilterMenu";

describe("FilterMenu", () => {
  it("opens the type submenu with the department chip and the check", () => {
    render(<FilterMenu open branch="Type" selected={{ Type: ["Housekeeping"] }} readOnly />);
    const housekeeping = screen.getByRole("menuitemcheckbox", { name: "Housekeeping" });
    expect(housekeeping).toHaveAttribute("aria-checked", "true");
    expect(housekeeping.querySelector(".dept")).toHaveAttribute("data-dept", "Housekeeping");
    expect(screen.getByRole("menuitemcheckbox", { name: "Front desk" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute("aria-expanded", "true");
  });

  it("draws status, urgency, assigned, and room the way the filter submenus do", () => {
    const { rerender } = render(<FilterSubmenu field="Status" selected={["In progress"]} readOnly />);
    expect(screen.getByRole("menuitemcheckbox", { name: "In progress" })).toHaveAttribute("aria-checked", "true");

    rerender(<FilterSubmenu field="Urgency" selected={["High"]} readOnly />);
    expect(screen.getByRole("menuitemcheckbox", { name: "Urgent" }).querySelector(".urgency-urgent")).toBeTruthy();
    expect(screen.getByRole("menuitemcheckbox", { name: "High" })).toHaveAttribute("aria-checked", "true");

    rerender(<FilterSubmenu field="Assigned" selected={["Mark"]} readOnly />);
    expect(screen.getByRole("menuitemcheckbox", { name: "Mark" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemcheckbox", { name: "Mark" }).querySelector(".avatar")).toHaveTextContent("MJ");
    expect(screen.getByText("Unassigned")).toBeTruthy();

    rerender(<FilterSubmenu field="Room" selected={["426"]} readOnly />);
    expect(screen.getByRole("menuitemcheckbox", { name: "426" })).toHaveAttribute("aria-checked", "true");
  });

  it("opens from the filter trigger", () => {
    render(<FilterMenu />);
    const trigger = screen.getByRole("button", { name: "Filters" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Room" })).toBeTruthy();
  });

  it("checks a room when the menu is interactive", () => {
    render(<FilterMenu open branch="Room" />);
    const room = screen.getByRole("menuitemcheckbox", { name: "244" });
    expect(room).toHaveAttribute("aria-checked", "false");
    fireEvent.click(room);
    expect(room).toHaveAttribute("aria-checked", "true");
  });
});
