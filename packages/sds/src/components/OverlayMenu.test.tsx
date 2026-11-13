import { describe, expect, it } from "vitest";
import { placeAtPoint, placeMenu } from "./OverlayMenu";

describe("placeAtPoint", () => {
  const view = { width: 800, height: 600 };
  const menu = { width: 132, height: 40 };

  it("opens at the pointer and keeps 8px from the viewport edge", () => {
    expect(placeAtPoint({ x: 20, y: 30 }, menu, view)).toEqual({ left: 20, top: 30 });
    expect(placeAtPoint({ x: 0, y: 0 }, menu, view)).toEqual({ left: 8, top: 8 });
    expect(placeAtPoint({ x: 790, y: 590 }, menu, view)).toEqual({ left: 660, top: 552 });
  });
});

describe("placeMenu", () => {
  it("opens a menu under a right-edge trigger toward the left", () => {
    const trigger = { top: 100, left: 800, right: 828, bottom: 128, width: 28, height: 28 } as DOMRect;
    const placed = placeMenu(trigger, { width: 132, height: 35 }, "below", "end");
    expect(placed).toEqual({ top: 132, left: 696 });
  });
});
