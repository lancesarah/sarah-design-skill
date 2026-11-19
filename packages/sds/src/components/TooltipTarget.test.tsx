import { afterEach, describe, expect, it, vi } from "vitest";
import { placeTooltip } from "./TooltipTarget";

afterEach(() => vi.restoreAllMocks());

describe("wrapped tooltip placement", () => {
  for (const edge of ["left", "right"] as const) {
    it(`keeps a multiline tooltip inside the ${edge} viewport edge`, () => {
      const host = document.createElement("span");
      const tip = document.createElement("span");
      tip.className = "tip";
      host.append(tip);
      document.body.append(host);
      vi.spyOn(host, "getBoundingClientRect").mockReturnValue(new DOMRect(edge === "left" ? 0 : window.innerWidth - 14, 20, 14, 14));
      vi.spyOn(tip, "getBoundingClientRect").mockImplementation(() => new DOMRect(Number.parseFloat(tip.style.left) - 140, Number.parseFloat(tip.style.top) - 64, 280, 64));
      placeTooltip(host);
      const box = tip.getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(8);
      expect(box.right).toBeLessThanOrEqual(window.innerWidth - 8);
      expect(box.top).toBeGreaterThanOrEqual(8);
      host.remove();
    });
  }

  it("retains centered placement when a compact tooltip fits", () => {
    const host = document.createElement("span");
    const tip = document.createElement("span");
    tip.className = "tip";
    host.append(tip);
    document.body.append(host);
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue(new DOMRect(400, 300, 14, 14));
    vi.spyOn(tip, "getBoundingClientRect").mockImplementation(() => new DOMRect(Number.parseFloat(tip.style.left) - 30, Number.parseFloat(tip.style.top) - 20, 60, 20));
    placeTooltip(host);
    expect(Number.parseFloat(tip.style.left)).toBe(407);
    expect(Number.parseFloat(tip.style.top)).toBe(292);
    host.remove();
  });
});
