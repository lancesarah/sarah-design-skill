import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { FileDropZone } from "../file-drop-zone";

it("opens the picker and delivers dropped files in order only while enabled", () => {
  const onChoose = vi.fn();
  const onFilesDropped = vi.fn();
  const props = { title: "Upload files", description: "Choose or drop files", onChoose, onFilesDropped };
  const files = [new File(["first"], "one.pdf"), new File(["second"], "two.pdf")];
  const { rerender } = render(<FileDropZone {...props} />);
  const zone = screen.getByRole("button", { name: /Upload files/ });

  fireEvent.click(zone);
  expect(onChoose).toHaveBeenCalledOnce();
  fireEvent.dragOver(zone);
  expect(zone.hasAttribute("data-dragging")).toBe(true);
  fireEvent.drop(zone, { dataTransfer: { files } });
  expect(zone.hasAttribute("data-dragging")).toBe(false);
  expect(onFilesDropped).toHaveBeenCalledWith(files);
  fireEvent.drop(zone, { dataTransfer: { files: [] } });

  rerender(<FileDropZone {...props} disabled />);
  fireEvent.click(zone);
  fireEvent.drop(zone, { dataTransfer: { files } });
  expect(onChoose).toHaveBeenCalledOnce();
  expect(onFilesDropped).toHaveBeenCalledOnce();
});
