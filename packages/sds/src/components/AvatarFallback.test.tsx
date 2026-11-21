import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./People";

describe("Avatar photo fallback",()=>{
  it("shows initials on failure and retries a changed photo URL",()=>{
    const view=render(<Avatar initials="SP" photo="/broken.png"/>);
    fireEvent.error(view.container.querySelector("img")!);
    expect(view.container.querySelector("img")).toBeNull();
    expect(screen.getByText("SP")).toBeVisible();
    view.rerender(<Avatar initials="SP" photo="/replacement.png"/>);
    expect(view.container.querySelector("img")).toHaveAttribute("src","/replacement.png");
  });
});
