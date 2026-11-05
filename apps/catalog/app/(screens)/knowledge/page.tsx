"use client";

import { Button, DataTable, DetailPanel, Icon, OverlayMenu, TITLE_TEXT_INSET, Tabs, captureClose, dateColumn, taskMenuItem, textColumn, type DataColumn } from "@lance-live/gallery-ui";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { FilterMenu, RangeControl, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { PageLayout } from "../page-layout";

const CATEGORIES = ["Amenities", "Policies", "Parking"];

const STARTER: Answer[] = [
  { id: "breakfast", bucket: "all", status: "verified", question: "Is breakfast included?", answer: "Breakfast is included for elite members.", category: "Amenities", asked: 18, variants: ["Is breakfast free?"] },
  { id: "parking", bucket: "review", status: "due", question: "Where do guests park?", answer: "Self parking is in the garage on 2nd.", category: "Parking", asked: 11, variants: [] },
  { id: "checkout", bucket: "weak", status: "weak", question: "How late is checkout?", answer: "Checkout is 11. Late checkout depends on occupancy.", category: "Policies", asked: 7, variants: [] },
  { id: "pool", bucket: "missed", status: "missed", question: "What time does the pool close?", answer: "No answer yet.", category: "Amenities", asked: 4, variants: ["When does the pool close?"] },
];

const STATUS: Record<string, string> = { verified: "Verified", due: "Due soon", weak: "Weak match", missed: "Missed" };

type Answer = {
  id: string;
  bucket: string;
  status: string;
  question: string;
  answer: string;
  category: string;
  asked: number;
  variants: string[];
};

const COLUMNS: Array<DataColumn<Answer>> = [
  {
    id: "status",
    title: "Status",
    role: "status",
    render: (row) => (
      <span className="status" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <StatusMark status={row.status} />
        {STATUS[row.status]}
      </span>
    ),
  },
  {
    id: "question",
    title: "Question",
    text: "primary",
    flex: true,
    labelInset: TITLE_TEXT_INSET,
    sortable: false,
    sortValue: (row) => row.question,
    render: (row) => (
      <div className={row.status === "verified" ? "kb-copy is-verified" : "kb-copy"}>
        <div className="title-sub">
          <div className="title-sub-titles">
            <span className="title-sub-field" style={row.question ? undefined : { color: "var(--black-50)" }}>
              {row.question || "Question"}
            </span>
          </div>
          <span className={row.answer ? "title-sub-note" : "title-sub-note is-hint"}>{row.answer || "Answer"}</span>
        </div>
      </div>
    ),
  },
  textColumn({ id: "category", title: "Category", size: "short", className: "kb-category", value: (row) => row.category }),
  dateColumn({ id: "asked", title: "Asked", value: (row) => String(row.asked) }),
];

function StatusMark({ status }: { status: string }) {
  if (status === "verified") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="var(--status-complete)" fillRule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z" />
      </svg>
    );
  }
  const stroke = status === "due" ? "var(--urgency-high)" : "var(--black-50)";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function hasAnswer(row: Answer) {
  const answer = row.answer.trim();
  return answer.length > 0 && answer !== "No answer yet.";
}

function AnswerDetail({
  row,
  hidden,
  onClose,
  onExited,
  onPatch,
  onDeleted,
}: {
  row: Answer;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onPatch: (patch: Partial<Answer>) => void;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLButtonElement>(null);
  const verified = row.status === "verified";
  const choices = row.category && !CATEGORIES.includes(row.category) ? [row.category, ...CATEGORIES] : CATEGORIES;

  function addVariant(event: FormEvent) {
    event.preventDefault();
    const next = draft.trim();
    if (!next || next === row.question || row.variants.includes(next)) {
      setDraft("");
      return;
    }
    onPatch({ variants: [...row.variants, next] });
    setDraft("");
  }

  return (
    <DetailPanel
      label="Answer"
      hidden={hidden}
      name={row.question || "Question"}
      noun="question"
      onClose={onClose}
      onExited={onExited}
      onDeleted={onDeleted}
      actions={
        verified ? null : (
          <Button variant="primary" disabled={!hasAnswer(row)} onClick={() => onPatch({ status: "verified", bucket: "all" })}>
            Verify
          </Button>
        )
      }
    >
      <div className="todo-side-intro">
        <textarea
          className="kb-question"
          aria-label="Question"
          rows={1}
          placeholder="Question"
          value={row.question}
          onChange={(event) => onPatch({ question: event.target.value })}
        />
        <div className="kb-status-row">
          <span className="status" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <StatusMark status={row.status} />
            {STATUS[row.status]}
          </span>
          <p className="kb-meta">
            Asked <b>{row.asked}×</b>
          </p>
        </div>
      </div>
      <div className="todo-side-rule" />
      <section className="kb-section">
        <h3 className="sheet-label">Answer</h3>
        <textarea
          className="kb-answer"
          aria-label="Answer"
          rows={4}
          placeholder="New answer"
          value={row.answer === "No answer yet." ? "" : row.answer}
          onChange={(event) => onPatch({ answer: event.target.value })}
        />
        <p className="kb-help">Lance paraphrases this. It never reads it out verbatim.</p>
      </section>
      <div className="todo-side-rule" />
      <section className="kb-section">
        <h3 className="sheet-label">Other ways guests ask this</h3>
        <div className="kb-variants">
          {row.variants.map((value) => (
            <div className="kb-variant" key={value}>
              <span>{value}</span>
              <button className="note-more" type="button" aria-label="Remove phrasing" onClick={() => onPatch({ variants: row.variants.filter((item) => item !== value) })}>
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
        <form className="kb-add" onSubmit={addVariant}>
          <textarea
            aria-label="Add another way guests ask this"
            placeholder="Add another way guests ask this"
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return;
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }}
          />
          <Button variant="secondary" type="submit">
            Add
          </Button>
        </form>
      </section>
      <div className="todo-side-rule" />
      <div className="todo-side-meta">
        <div>
          <span className="sheet-label">Category</span>
          <button
            ref={categoryRef}
            className={row.category ? "side-field" : "side-field is-empty"}
            type="button"
            aria-haspopup="menu"
            aria-expanded={categoryOpen}
            onClick={() => setCategoryOpen((open) => !open)}
          >
            <span>{row.category || "—"}</span>
            <Icon name="chevron" size={10} className="sheet-edit" />
          </button>
          <OverlayMenu open={categoryOpen} anchorRef={categoryRef} label="Category" onPointerDown={(event) => event.stopPropagation()}>
            {choices.map((option) =>
              taskMenuItem(option, option === row.category, () => {
                onPatch({ category: option });
                setCategoryOpen(false);
              }, option),
            )}
          </OverlayMenu>
        </div>
      </div>
    </DetailPanel>
  );
}

export default function KnowledgePage() {
  const [answers, setAnswers] = useState(STARTER);
  const [bucket, setBucket] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [range, setRange] = useState("30d");
  const [selected, setSelected] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const retained = useRef<Answer | null>(null);

  const visible = useMemo(
    () =>
      answers.filter(
        (row) =>
          (bucket === "all" || row.bucket === bucket || (bucket === "recommendations" && row.bucket === "review")) &&
          (!category || row.category === category) &&
          `${row.question} ${row.answer} ${row.variants.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [answers, bucket, category, query],
  );
  const open = answers.find((row) => row.id === selected) ?? null;
  if (open) retained.current = open;

  useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    setHidden(true);
  }, [open]);

  useEffect(() => {
    if (!present || !open) return;
    const frame = requestAnimationFrame(() => setHidden(false));
    return () => cancelAnimationFrame(frame);
  }, [present, open]);

  useEffect(() => {
    if (!present || !hidden || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduce ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [present, hidden, open]);

  function patch(id: string, next: Partial<Answer>) {
    setAnswers((list) => list.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  function addQuestion() {
    const id = `question-${Date.now()}`;
    const blank: Answer = { id, bucket: "review", status: "due", question: "", answer: "", category: "", asked: 0, variants: [] };
    setBucket("all");
    setQuery("");
    setCategory("");
    setAnswers((list) => [blank, ...list]);
    setSelected(id);
    setEnteringId(id);
  }

  return (
    <PageLayout
      className="sheet-page kb-page"
      data-view="head"
      data-bucket={bucket}
      icon="book"
      title="Knowledge base"
      count={visible.length}
      actions={
        <Button onClick={addQuestion}>
          <Icon name="plus-bold" size={14} />
          Add question
        </Button>
      }
      tabs={
        <Tabs
          label="Knowledge base"
          value={bucket}
          onValueChange={setBucket}
          items={[
            { value: "all", label: "All", count: answers.length },
            { value: "review", label: "Needs review", count: answers.filter((row) => row.bucket === "review").length },
            { value: "missed", label: "Missed", count: answers.filter((row) => row.bucket === "missed").length },
            { value: "weak", label: "Weak match", count: answers.filter((row) => row.bucket === "weak").length },
            { value: "recommendations", label: "Recommendations", count: answers.filter((row) => row.bucket === "review").length },
          ]}
        />
      }
      toolbar={
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search answers" label="Search answers" value={query} onValueChange={setQuery} />
          <FilterMenu value={category} onValueChange={setCategory} options={CATEGORIES} />
          <div className="filter-chips">
            {category ? (
              <button className="chip chip-filter" type="button" onClick={() => setCategory("")}>
                <span className="chip-k">Category</span>: {category} <Glyph name="plus" size={10} className="x" />
              </button>
            ) : null}
          </div>
          <RangeControl label="Activity window" value={range} onValueChange={setRange} />
        </div>
      }
    >
      <section className="kb-health" aria-label="Hotel knowledge health">
        <div className="kb-health-score">
          <p className="kb-health-label">
            Hotel knowledge health
            <Glyph name="info" size={14} />
          </p>
          <div className="kb-score-row">
            <p className="kb-score-figures">
              <span className="kb-score-num">41</span>
              <span className="kb-score-of">/ 80</span>
            </p>
            <span className="urgency urgency-urgent">Needs work</span>
          </div>
          <div className="kb-meter" role="img" aria-label="41 out of 80">
            <div className="kb-meter-fill" style={{ width: `${(41 / 80) * 100}%` }} />
          </div>
        </div>
        <div className="kb-health-rule" aria-hidden="true" />
        <div className="kb-health-questions">
          <h2>Questions</h2>
          <dl className="kb-facts">
            <div>
              <dt>Due soon</dt>
              <dd>148</dd>
              <dd className="kb-fact-delta">-1 just now</dd>
            </div>
            <div>
              <dt>Missed FAQs</dt>
              <dd>40</dd>
            </div>
            <div>
              <dt>Stale</dt>
              <dd>30</dd>
            </div>
            <div>
              <dt>Weak matches</dt>
              <dd>88</dd>
            </div>
          </dl>
        </div>
      </section>
      <div className="sheet-work">
        <div className="sheet-list">
          <div className="stage sheet-stage">
            <DataTable
              rows={visible}
              total={answers.length}
              empty="No answers"
              columns={COLUMNS}
              selectedId={selected}
              enteringId={enteringId}
              onRowClick={(row) => setSelected((current) => (current === row.id ? null : row.id))}
              onRowContextMenu={(row) => setSelected(row.id)}
              onDelete={(row) => {
                const play = captureClose(document.querySelector(`[data-record="${CSS.escape(row.id)}"]`));
                flushSync(() => {
                  setAnswers((list) => list.filter((item) => item.id !== row.id));
                  setSelected((current) => (current === row.id ? null : current));
                });
                play();
              }}
              deleteNoun="question"
              rowName={(row) => row.question.trim() || "Question"}
            />
          </div>
        </div>
      </div>
      {present && retained.current ? (
        <AnswerDetail
          key={retained.current.id}
          row={retained.current}
          hidden={hidden}
          onClose={() => setSelected(null)}
          onExited={() => setPresent(false)}
          onPatch={(next) => {
            const id = retained.current?.id;
            if (id) patch(id, next);
          }}
          onDeleted={() => {
            const id = retained.current?.id;
            if (!id) return;
            const play = captureClose(document.querySelector(`[data-record="${CSS.escape(id)}"]`));
            flushSync(() => {
              setAnswers((list) => list.filter((row) => row.id !== id));
              setSelected(null);
            });
            play();
          }}
        />
      ) : null}
    </PageLayout>
  );
}
