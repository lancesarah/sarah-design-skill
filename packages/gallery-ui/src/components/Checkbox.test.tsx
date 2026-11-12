import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders an unchecked box and toggles when uncontrolled", () => {
    render(<Checkbox>Pennies</Checkbox>);
    const box = screen.getByRole("checkbox", { name: "Pennies" });
    expect(box).toHaveClass("sds", "check");
    expect(box).toHaveAttribute("aria-checked", "false");
    expect(box.querySelector(".check-box svg")).toBeNull();

    fireEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
    expect(box.querySelector(".check-box svg")).toBeTruthy();
  });

  it("keeps a controlled value and reports the next one", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked onCheckedChange={onCheckedChange}>
        AM in
      </Checkbox>,
    );
    const box = screen.getByRole("checkbox", { name: "AM in" });
    expect(box).toHaveAttribute("aria-checked", "true");

    fireEvent.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("paints a frozen hover and skips that class when disabled", () => {
    const { rerender } = render(<Checkbox state="hover">Deposit/drop</Checkbox>);
    expect(screen.getByRole("checkbox")).toHaveClass("is-hover");

    rerender(
      <Checkbox state="hover" disabled>
        Deposit/drop
      </Checkbox>,
    );
    const box = screen.getByRole("checkbox");
    expect(box).toBeDisabled();
    expect(box).not.toHaveClass("is-hover");
  });

  it("draws the large box with a larger check", () => {
    render(
      <Checkbox size="lg" checked>
        Robin
      </Checkbox>,
    );
    const box = screen.getByRole("checkbox", { name: "Robin" });
    expect(box).toHaveClass("check-lg");
    expect(box.querySelector(".check-box svg")).toHaveAttribute("width", "12");
  });
});
