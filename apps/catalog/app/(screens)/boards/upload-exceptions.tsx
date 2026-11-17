"use client";

import { useState } from "react";
import { Button, DataTable, EditorDialog, Menu, SettingsCard, SettingsRow } from "@lance-live/sds";
import { SERVICES, type Service } from "./data";

const EXCEPTIONS = {
  date: "Report date doesn’t match",
  incomplete: "Incomplete scan",
  service: "Review service corrections",
  failed: "Import couldn’t finish",
};
type Exception = keyof typeof EXCEPTIONS;
export type ExceptionPreview = "choose" | Exception;

const EXTRACTED = [
  { id: "304", service: "Full clean", status: "Vacant dirty" },
  { id: "305", service: "Check-out", status: "Occupied dirty" },
  { id: "306", service: "Refresh", status: "Vacant clean" },
];
const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const EXTRACTED_CSV = "Room,Service,Status\r\n" + EXTRACTED.map(row => [row.id, row.service, row.status].join(",")).join("\r\n");

export function UploadExceptions({ preview, date, onPreview, onBack, onReview, onClose }: {
  preview: ExceptionPreview;
  date: string;
  onPreview: (preview: ExceptionPreview) => void;
  onBack: () => void;
  onReview: (service?: Service) => void;
  onClose: () => void;
}) {
  const [service, setService] = useState<Service>("checkout");
  const [serviceOpen, setServiceOpen] = useState(false);
  const boardDate = new Date(`${date}T00:00:00Z`);
  const reportDate = new Date(boardDate);
  reportDate.setUTCDate(reportDate.getUTCDate() - 1);
  const file = "Room status report.pdf";
  const back = <Button variant="secondary" onClick={() => onPreview("choose")}>All previews</Button>;
  const footer = {
    choose: <Button variant="secondary" onClick={onBack}>Back to upload</Button>,
    date: <><Button variant="secondary" onClick={onBack}>Back to files</Button><Button onClick={() => onReview()}>Review for {DATE.format(boardDate)}</Button></>,
    incomplete: <><Button variant="secondary" onClick={() => {
      const link = document.createElement("a");
      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(EXTRACTED_CSV)}`;
      link.download = "board-report-unverified.csv";
      link.click();
    }}>Download unverified CSV</Button><Button onClick={onBack}>Back to files</Button></>,
    service: <>{back}<Button onClick={() => onReview(service)}>Continue to review</Button></>,
    failed: <>{back}<Button onClick={onClose}>Return to Boards</Button></>,
  }[preview];

  return <EditorDialog kicker={preview === "choose" ? "Import exceptions" : EXCEPTIONS[preview]} title="" layout="pills"
    className="board-upload-dialog is-processing board-upload-exception" onClose={onBack} footer={<div className="board-upload-actions">{footer}</div>}
    onEscape={() => {
      if (!serviceOpen) return false;
      setServiceOpen(false);
      return true;
    }}>
    {preview === "choose" && <>
      <p className="hk-help">Choose a sample scenario to see how Boards handles an import exception.</p>
      <SettingsCard label="Import exception previews">
        {(Object.keys(EXCEPTIONS) as Exception[]).map(key => <SettingsRow key={key} label={EXCEPTIONS[key]}>
          <Button variant="secondary" onClick={() => onPreview(key)} aria-label={`Preview ${EXCEPTIONS[key]}`}>Preview</Button>
        </SettingsRow>)}
      </SettingsCard>
    </>}
    {preview === "date" && <>
      <p className="board-upload-warning" role="alert">This report is dated {DATE.format(reportDate)}. The board you’re viewing is for {DATE.format(boardDate)}.</p>
      <SettingsCard label="Report details">
        <SettingsRow label="File"><span className="board-upload-exception-file">{file}</span></SettingsRow>
        <SettingsRow label="Report date">{DATE.format(reportDate)}</SettingsRow>
        <SettingsRow label="Board date">{DATE.format(boardDate)}</SettingsRow>
      </SettingsCard>
    </>}
    {preview === "incomplete" && <>
      <p className="board-upload-error" role="alert">We found 3 of the 5 rooms listed in {file}. No rooms were imported.</p>
      <DataTable rows={EXTRACTED} columns={[
        { id: "room", title: "Room", render: row => row.id },
        { id: "service", title: "Service", flex: true, render: row => row.service },
        { id: "status", title: "Status", flex: true, render: row => row.status },
      ]} />
      <p className="hk-help">Review the rooms we could read, then upload the complete report.</p>
    </>}
    {preview === "service" && <>
      <p className="hk-help">We found a service code that needs your confirmation before import.</p>
      <SettingsCard label="Service correction">
        <SettingsRow label="Room 704" description="Source code: DEP">
          <Menu items={SERVICES} value={service} open={serviceOpen} onOpenChange={setServiceOpen} triggerLabel="Service for room 704" placeholderIcon="clean-full" onValueChange={value => setService(value as Service)} />
        </SettingsRow>
      </SettingsCard>
    </>}
    {preview === "failed" && <>
      <p className="board-upload-error" role="alert">We couldn’t confirm whether the rooms were imported.</p>
      <p className="hk-help">Check the board before trying again so you don’t create duplicate rooms.</p>
      <SettingsCard label="Import details">
        <SettingsRow label="File"><span className="board-upload-exception-file">{file}</span></SettingsRow>
        <SettingsRow label="Rooms submitted">3</SettingsRow>
      </SettingsCard>
    </>}
  </EditorDialog>;
}
