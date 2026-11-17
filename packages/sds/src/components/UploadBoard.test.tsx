import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadBoard } from "../../../../apps/catalog/app/(screens)/boards/upload-board";

describe("Upload board preview", () => {
  it("accepts multiple supported files and rejects other file types", () => {
    render(<UploadBoard onClose={() => {}} />);
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(["room\n319"], "rooms.csv", { type: "text/csv" }), new File(["pdf"], "board.pdf", { type: "application/pdf" }), new File(["bad"], "app.exe")] } });
    expect(screen.getByText("rooms.csv")).toBeVisible();
    expect(screen.getByText("board.pdf")).toBeVisible();
    expect(screen.getByText("3 B")).toBeVisible();
    expect(screen.getByRole("button", { name: "Process 2 Files" })).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Choose images, PDFs, or CSV files.");
    fireEvent.click(screen.getByRole("button", { name: "Remove rooms.csv" }));
    expect(screen.queryByText("rooms.csv")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Process 1 File" })).toBeVisible();
  });
  it("advances a pasted image to the sample review", async () => {
    render(<UploadBoard onClose={() => {}} />);
    fireEvent.paste(document, { clipboardData: { files: [new File(["image"], "pasted.png", { type: "image/png" })] } });
    expect(screen.getByText("pasted.png")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Process 1 File" }));
    expect(screen.getByRole("dialog", { name: "Scanning…" })).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Scan progress" })).toHaveAttribute("aria-valuenow", "0");
    expect(await screen.findByRole("dialog", { name: "Review & Import" }, { timeout: 2500 })).toBeVisible();
    expect(screen.getByRole("button", { name: "Import 3" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Back to files" }));
    expect(screen.getByText("pasted.png")).toBeVisible();
  });
});
