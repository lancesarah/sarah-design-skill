import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AssignedDropdown } from "./table-columns";

afterEach(() => vi.restoreAllMocks());

it("shows the portrait and full name in the form trigger and keeps the empty avatar after unassigning", () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(40, 40, 132, 32));
  const onSelect = vi.fn();
  render(<AssignedDropdown value="a" people={[{name: "a", fullName: "Alex Reed", avatar: "AR", photo: "/alex.png"}]} onSelect={onSelect} />);
  const trigger = screen.getByRole("button", {name: "Alex Reed"});
  const image = trigger.querySelector("img")!;
  expect(image).toHaveAttribute("src", "/alex.png");
  fireEvent.error(image);
  expect(within(trigger).getByText("AR")).toBeVisible();
  fireEvent.click(trigger);
  const person = screen.getByRole("menuitemradio", {name: "Alex Reed"});
  expect(person.querySelector("img")).toHaveAttribute("src", "/alex.png");
  const empty = screen.getByRole("menuitemradio", {name: "Unassigned"});
  expect(empty.querySelector(".avatar.is-empty")).toBeTruthy();
  fireEvent.click(empty);
  expect(onSelect).toHaveBeenCalledWith("unassigned");
  expect(within(trigger).getByText("Unassigned")).toHaveClass("dim");
  expect(trigger.querySelector(".avatar.is-empty")).toBeTruthy();
});
