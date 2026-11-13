"use client";

import { Chip, DataTable, Tabs, captureClose, dateColumn, textColumn, type DataColumn } from "@lance-live/sds";
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { putBack, useNotify } from "../action-toast";
import { FilterMenu, RangeControl, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { PageLayout } from "../page-layout";
import { CallDetails, RESOLUTION_LABEL, initialCalls, type CallRecord, type CallResolution } from "./CallDetails";

const TABS = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "transferred", label: "Transferred" },
  { value: "abandoned", label: "Abandoned" },
  { value: "missed", label: "Missed" },
];

type CallRow = CallRecord & { shown: CallResolution };

const COLUMNS: Array<DataColumn<CallRow>> = [
  textColumn({ id: "caller", title: "Caller", size: "short", className: "call-phone", value: (call) => call.phone }),
  textColumn({ id: "summary", title: "Summary", size: "primary", className: "call-summary-text", value: (call) => call.summary }),
  {
    id: "resolution",
    title: "Resolution",
    render: (call) => (
      <span className="call-resolution" data-resolution={call.shown} style={{ paddingInline: 0 }}>
        {call.shown === "missed" ? <Glyph name="warn" /> : null}
        {RESOLUTION_LABEL[call.shown]}
      </span>
    ),
  },
  dateColumn({ id: "when", title: "When", value: (call) => call.when }),
];

export default function CallsPage() {
  const notify = useNotify();
  const [calls, setCalls] = useState(initialCalls);
  const [bucket, setBucket] = useState("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("24h");
  const [depts, setDepts] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; resolution: CallResolution } | null>(null);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setCalls((list) => list.map((call) => (call.id === pending.id ? { ...call, resolution: pending.resolution } : call)));
      setPending(null);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [pending]);

  const visible = useMemo(
    () =>
      calls.filter((call) => {
        const tab =
          bucket === "all" ||
          (bucket === "attention" ? call.resolution === "missed" || call.resolution === "abandoned" : call.resolution === bucket);
        const text = `${call.phone} ${call.summary}`.toLowerCase().includes(query.trim().toLowerCase());
        return tab && text && (depts.length === 0 || depts.includes(call.dept));
      }),
    [bucket, calls, depts, query],
  );
  const [shownId, setShownId] = useState<string | null>(null);
  const open = calls.find((call) => call.id === selected) ?? null;
  const panelCall = calls.find((call) => call.id === (selected ?? shownId)) ?? null;

  useEffect(() => {
    if (selected) setShownId(selected);
  }, [selected]);
  const shownResolution = (call: CallRecord) => (pending?.id === call.id ? pending.resolution : call.resolution);
  const rows = useMemo(
    () => visible.map((call) => ({ ...call, shown: pending?.id === call.id ? pending.resolution : call.resolution })),
    [visible, pending],
  );

  function removeCall(id: string) {
    const index = calls.findIndex((item) => item.id === id);
    const removed = calls[index];
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(id)}"]`));
    flushSync(() => {
      setCalls((list) => list.filter((item) => item.id !== id));
      setSelected((current) => (current === id ? null : current));
      setShownId((current) => (current === id ? null : current));
      setPending((current) => (current?.id === id ? null : current));
    });
    play();
    if (removed) notify({ message: "Call deleted", action: "Undo", onAction: () => setCalls((list) => putBack(list, removed, index)) });
  }

  function chooseResolution(id: string, next: CallResolution) {
    const call = calls.find((item) => item.id === id);
    if (!call) return;
    setPending((current) => (current?.id === id ? null : current));
    if (next === call.resolution) return;
    const stays =
      bucket === "all" || (bucket === "attention" ? next === "missed" || next === "abandoned" : next === bucket);
    if (stays) {
      setCalls((list) => list.map((item) => (item.id === id ? { ...item, resolution: next } : item)));
      return;
    }
    setPending({ id, resolution: next });
  }

  return (
    <PageLayout
      className="sheet-page calls-page"
      data-view="head"
      icon="phone"
      title="Call history"
      count={visible.length}
      tabs={
        <Tabs
          label="Call history"
          value={bucket}
          onValueChange={setBucket}
          items={TABS.map((tab) => ({
            ...tab,
            count: calls.filter((call) =>
              tab.value === "all"
                ? true
                : tab.value === "attention"
                  ? call.resolution === "missed" || call.resolution === "abandoned"
                  : call.resolution === tab.value,
            ).length,
          }))}
        />
      }
      toolbar={
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search calls" label="Search calls" value={query} onValueChange={setQuery} />
          <FilterMenu value={depts} onValueChange={setDepts} options={["Front Desk", "Housekeeping", "Food & Beverage"]} />
          <div className="filter-chips">
            {depts.map((value) => (
              <Chip key={value} filter={{ name: "Department", value }} onClick={() => setDepts((current) => current.filter((item) => item !== value))} />
            ))}
          </div>
          <RangeControl label="Time range" value={range} onValueChange={setRange} />
        </div>
      }
    >
      <div className="sheet-work">
        <div className="sheet-list">
          <div className="stage sheet-stage">
            <DataTable
              rows={rows}
              total={calls.length}
              empty="No calls"
              selectedId={selected}
              onRowClick={(call) => setSelected(call.id)}
              onRowContextMenu={(call) => setSelected(call.id)}
              onDelete={(call) => removeCall(call.id)}
              deleteNoun="call"
              rowName={(call) => call.summary.trim() || call.phone}
              columns={COLUMNS}
            />
          </div>
        </div>
        {panelCall ? (
          <CallDetails
            call={panelCall}
            resolution={shownResolution(panelCall)}
            hidden={!open}
            onClose={() => setSelected(null)}
            onResolution={(next) => chooseResolution(panelCall.id, next)}
            onDepartment={(next) => setCalls((list) => list.map((item) => (item.id === panelCall.id ? { ...item, dept: next } : item)))}
            onReply={(text) =>
              setCalls((list) =>
                list.map((item) =>
                  item.id === panelCall.id
                    ? {
                        ...item,
                        comments: [
                          {
                            name: "Sarah Mou",
                            initials: "SM",
                            text,
                            at: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
                          },
                          ...item.comments,
                        ],
                      }
                    : item,
                ),
              )
            }
            onDeleteComment={(index) =>
              setCalls((list) =>
                list.map((item) => (item.id === panelCall.id ? { ...item, comments: item.comments.filter((_, commentIndex) => commentIndex !== index) } : item)),
              )
            }
            onDelete={() => removeCall(panelCall.id)}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
