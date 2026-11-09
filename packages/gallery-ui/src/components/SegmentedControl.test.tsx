import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "open", label: "Open" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
];

function Harness() {
  const [value, setValue] = useState("open");
  return <SegmentedControl aria-label="Status" value={value} onValueChange={setValue} options={options} />;
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  document.documentElement.classList.remove("is-keys");
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("segment") ? 60 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    if (!this.classList.contains("segment") || !this.parentElement) return 0;
    return [...this.parentElement.querySelectorAll(".segment")].indexOf(this) * 70;
  });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(3);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(24);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(225);
});

describe("SegmentedControl", () => {
  it("selects a segment and moves the pill", () => {
    render(<Harness />);
    const pill = document.querySelector<HTMLElement>(".slide-pill");
    expect(pill).not.toBeNull();
    expect(screen.getByRole("tab", { name: "Open" })).toHaveAttribute("aria-selected", "true");
    expect(pill?.style.left).toBe("0px");

    fireEvent.click(screen.getByRole("tab", { name: "Scheduled" }));

    expect(screen.getByRole("tab", { name: "Scheduled" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Open" })).toHaveAttribute("aria-selected", "false");
    expect(pill?.style.left).toBe("70px");
    expect(pill?.style.right).toBe("95px");
    expect(pill?.dataset.dir).toBe("right");
  });

  it("snaps the pill when the selection comes from the keyboard", () => {
    render(<Harness />);
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Scheduled" })).toHaveAttribute("aria-selected", "true");
    expect(document.documentElement.classList.contains("is-keys")).toBe(true);
    expect(document.querySelector<HTMLElement>(".slide-pill")?.style.left).toBe("70px");
  });

  it("shows a count as its own figure", () => {
    render(
      <SegmentedControl
        aria-label="Source status"
        value="active"
        options={[
          { value: "active", label: "Active", count: 5 },
          { value: "inactive", label: "Inactive", count: 3 },
        ]}
      />,
    );
    const active = screen.getByRole("tab", { name: "Active5" });
    expect(active.querySelector(".count")).toHaveTextContent("5");
    expect(active).not.toHaveTextContent("(");
  });

  it("warns in development when more than three views are passed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <SegmentedControl
        aria-label="Too many"
        value="a"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
          { value: "c", label: "C" },
          { value: "d", label: "D" },
        ]}
      />,
    );
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
