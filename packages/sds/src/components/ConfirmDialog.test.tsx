import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

describe("ConfirmDialog controlled actions", () => {
  it("renders rich descriptions and extra body content with custom action copy", () => {
    render(<ConfirmDialog open name="" title={<>Remove <em>route</em>?</>} detail={<div>Existing assignments stay.</div>} confirmLabel="Remove route" cancelLabel="Keep route"><ul><li>Room service</li></ul></ConfirmDialog>);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Remove route?");
    expect(screen.getByRole("listitem")).toHaveTextContent("Room service");
    expect(screen.getByRole("button", { name: "Keep route" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Remove route" })).toBeEnabled();
  });
  it("blocks confirming and cancelling while busy, including Escape and the scrim", () => {
    const confirm = vi.fn(); const cancel = vi.fn();
    render(<ConfirmDialog open name="route" busy onConfirm={confirm} onCancel={cancel} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);
    expect(confirm).not.toHaveBeenCalled(); expect(cancel).not.toHaveBeenCalled();
    expect(dialog).toHaveAttribute("open");
  });
  it("lets an async caller keep the dialog open until controlled completion", () => {
    const confirm = vi.fn((event) => event.preventDefault());
    const { rerender } = render(<ConfirmDialog open name="route" keepOpenOnConfirm onConfirm={confirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    rerender(<ConfirmDialog open={false} name="route" keepOpenOnConfirm onConfirm={confirm} />);
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });
  it("does not queue duplicate callbacks while the closing animation runs", () => {
    vi.useFakeTimers();
    try {
      const confirm = vi.fn();
      render(<ConfirmDialog open name="route" onConfirm={confirm} />);
      const button = screen.getByRole("button", { name: "Delete" });
      fireEvent.click(button);
      fireEvent.click(button);
      vi.advanceTimersByTime(240);
      expect(confirm).toHaveBeenCalledTimes(1);
    } finally { vi.useRealTimers(); }
  });

});
