import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("draws a full-width rule before Delete and keeps Delete last", () => {
    render(
      <Menu
        open
        items={[
          { value: "Share", label: "Share", icon: "share" },
          { value: "Edit", label: "Edit", icon: "edit" },
          { value: "Delete", label: "Delete", icon: "trash", danger: true },
        ]}
      />,
    );
    const items = screen.getAllByRole("menuitem");
    const radios = screen.getAllByRole("menuitemradio");
    expect(radios.map((item) => item.textContent)).toEqual(["Share", "Edit"]);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Delete");
    expect(items[0]).toHaveClass("danger");
    expect(items[0].previousElementSibling).toHaveClass("menu-rule");
  });
});
