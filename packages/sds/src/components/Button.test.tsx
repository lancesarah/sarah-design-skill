import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("uses the primary gallery classes", () => {
    render(<Button>New</Button>);
    expect(screen.getByRole("button", { name: "New" })).toHaveClass("sds", "btn");
    expect(screen.getByRole("button")).not.toHaveClass("btn-secondary", "btn-danger", "is-hover");
  });

  it("marks secondary, danger, and icon buttons", () => {
    const { rerender } = render(<Button variant="secondary">New</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-secondary");

    rerender(<Button variant="tertiary">Required</Button>);
    expect(screen.getByRole("button", { name: "Required" })).toHaveClass("btn-tertiary");

    rerender(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("btn-danger");

    rerender(
      <Button icon aria-label="New">
        <svg />
      </Button>,
    );
    expect(screen.getByRole("button", { name: "New" })).toHaveClass("btn-icon");
  });

  it("paints a frozen hover and skips that class when disabled", () => {
    const { rerender } = render(<Button state="hover">New</Button>);
    expect(screen.getByRole("button")).toHaveClass("is-hover");

    rerender(
      <Button state="hover" disabled>
        New
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).not.toHaveClass("is-hover");
  });
});
