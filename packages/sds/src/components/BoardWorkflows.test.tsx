import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoardCalendar, LimitsPage, RoomEditor, ReportPage, defaultLimits } from "../../../../apps/catalog/app/(screens)/boards/workflow-pages";
import { ROOMS, STAFF } from "../../../../apps/catalog/app/(screens)/boards/data";

describe("Board workflow previews", () => {
  it("selects a real calendar date across month boundaries", () => {
    const change = vi.fn();
    render(<BoardCalendar value="2026-11-14" onChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    fireEvent.click(screen.getByRole("button", { name: "Tuesday, December 1, 2026" }));
    expect(change).toHaveBeenCalledWith("2026-12-01");
  });
  it("allows clearing inherited limits and rejects negatives", () => {
    const save = vi.fn();
    render(<LimitsPage value={defaultLimits} staff={STAFF} onSave={save} onBack={() => {}} />);
    const field = screen.getAllByRole("spinbutton")[0];
    fireEvent.change(field, { target: { value: "-1" } });
    expect(screen.getByRole("button", { name: "Save limits" })).toBeDisabled();
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save limits" }));
    expect(save.mock.calls[0][0].global.Rooms).toBeUndefined();
    expect(defaultLimits.global.Rooms).toBe(15);
  });
  it("blocks a duplicate room and saves an existing room without duplicating it", () => {
    const save = vi.fn();
    const { rerender } = render(<RoomEditor room={{...ROOMS[0], id: "duplicate"}} rooms={ROOMS} staff={STAFF} onSave={save} onBack={() => {}} />);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    rerender(<RoomEditor key="edit" room={ROOMS[0]} rooms={ROOMS} staff={STAFF} onSave={save} onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(save).toHaveBeenCalledWith(ROOMS[0]);
  });
  it("collects opening staff and lets the report roster be edited", () => {
    render(<ReportPage rooms={ROOMS} staff={STAFF} date="2026-11-15" onBack={() => {}} />);
    const opening = screen.getByRole("textbox", { name: "Opening" });
    fireEvent.change(opening, { target: { value: "William" } });
    expect(opening).toHaveValue("William");
    expect(screen.getByRole("textbox", { name: "Overnight houseperson" })).toBeVisible();
    expect(screen.getByRole("spinbutton", { name: "Open / dropped rooms" })).toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "Housekeeper name" }), { target: { value: "Cinthia" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Cinthia from report" }));
    expect(screen.queryByRole("button", { name: "Remove Cinthia from report" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review report" }));
    const summary = screen.getByRole("region", { name: "Opening report summary" });
    expect(summary).toHaveTextContent("William");
    expect(screen.queryByRole("textbox", { name: "Opening" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit report" }));
    expect(screen.getByRole("textbox", { name: "Opening" })).toHaveValue("William");
  });
  it("requires review before showing the simulated send result", () => {
    const back = vi.fn();
    render(<ReportPage rooms={ROOMS} staff={STAFF} date="2026-11-14" onBack={back} />);
    expect(screen.queryByRole("button", { name: "Simulate send" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Report recipient" }), { target: { value: "draft@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Review report" }));
    const recipient = screen.getByRole("textbox", { name: "Report recipient" });
    expect(recipient).toHaveValue("draft@example.com");
    fireEvent.change(recipient, { target: { value: "invalid-email" } });
    expect(screen.getByRole("button", { name: "Simulate send" })).toBeDisabled();
    fireEvent.change(recipient, { target: { value: "ops@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Simulate send" }));
    expect(screen.getByRole("heading", { name: "Send preview complete" })).toBeVisible();
    expect(screen.getByText(/No email was sent/)).toBeVisible();
    expect(screen.getByText("ops@example.com")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Back to Boards" }));
    expect(back).toHaveBeenCalledOnce();
  });

  it("shows copy feedback on the report button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    try {
      render(<ReportPage rooms={ROOMS} staff={STAFF} date="2026-11-14" onBack={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: "Review report" }));
      const copyButton = screen.getByRole("button", { name: "Copy report" });
      fireEvent.click(copyButton);
      expect(await screen.findByRole("button", { name: "Copied!" })).toBe(copyButton);
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining("HSK OPENING 11-14-2026"));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
