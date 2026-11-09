const CATS = ["Hours", "Policies", "Fees", "Parking", "Amenities"];
const AVAIL = ["Permanent", "Seasonal"];
const STATUS = { verified: "Verified", due: "Due soon", stale: "Stale" };
const RANGE_LABEL = { "24h": "24h", "7d": "7d", "30d": "30d" };
const RESOLVE = { transferred: "Transferred", resolved: "Resolved", missed: "Missed", abandoned: "Abandoned" };
const HEADS = {
  all: ["Status", "Question", "Answer", "Category", "Asked"],
  review: ["Status", "Question", "Answer", "Category", "Asked"],
  missed: ["Status", "Question", "Answer", "Category", "Asked"],
  weak: ["Status", "Question", "Answered with", "Category", "When"],
};
const COMPLETE_HOLD = 700;
const TODAY = "2026-11-03";

const OPEN = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--urgency-high)" stroke-width="2"/></svg>';
const DONE = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="var(--status-complete)" fill-rule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"/></svg>';
const STALE = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--black-50)" stroke-width="2"/></svg>';
const CHECK = '<svg class="i check" width="14" height="14"><use href="#i-check"/></svg>';
const CHEV = '<svg class="i sheet-edit" width="10" height="10" aria-hidden="true"><use href="#i-chevron"/></svg>';

const page = document.querySelector(".kb-page");
const sheet = document.querySelector("[data-sheet]");
const empty = document.querySelector("[data-empty]");
const count = document.querySelector("[data-count]");
const sheetCount = document.querySelector("[data-sheet-count]");
const tabs = [...document.querySelectorAll(".tabs-bar [data-bucket]")];
const searchInput = document.querySelector("[data-kb-search] input");
const chips = document.querySelector("[data-chips]");
const filterMenu = document.querySelector("[data-filter-menu]");
const rowMenu = document.querySelector("#row-menu");
const fieldMenu = document.querySelector("#field-menu");
const confirmDialog = document.querySelector(".confirm-dialog");
const side = document.querySelector("#kb-side");
const groupsEl = document.querySelector("[data-groups]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let seq = 1;
const selected = new Set();
let sideItem = null;
let sideMode = "record";
let weakSource = null;
let combineGroup = null;
let menuTarget = null;
let fieldButton = null;
let pendingDelete = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function item(partial) {
  return {
    id: seq++,
    kind: "faq",
    question: "",
    answer: "",
    category: "",
    status: "due",
    asked: { "24h": 0, "7d": 0, "30d": 0 },
    verifiedOn: null,
    lastAsked: null,
    variants: [],
    calls: [],
    availability: "Permanent",
    group: null,
    matchedId: null,
    draft: "",
    el: null,
    _hold: 0,
    ...partial,
  };
}

const items = [
  item({
    question: "What time can I check in?",
    answer: "Check-in begins at 3:00 pm.",
    category: "Hours",
    status: "due",
    asked: { "24h": 1, "7d": 8, "30d": 45 },
    verifiedOn: "2026-04-07",
    variants: ["When can I check in?"],
    calls: [
      { phone: "+1 (213) 477-3732", date: "2026-11-01", resolution: "transferred" },
      { phone: "+1 (804) 572-4448", date: "2026-10-22", resolution: "resolved" },
    ],
  }),
  item({
    question: "How much does early check-in cost?",
    answer: "Early check-in before 12:00 pm is $45 plus tax, and it is not guaranteed.",
    category: "Fees",
    status: "due",
    asked: { "24h": 0, "7d": 6, "30d": 34 },
    verifiedOn: "2026-04-06",
  }),
  item({
    question: "Can I request a late check-in if my flight arrives late?",
    answer: "Yes. Call ahead and the front desk will hold the room.",
    category: "Policies",
    status: "stale",
    asked: { "24h": 0, "7d": 2, "30d": 17 },
    verifiedOn: null,
  }),
  item({
    question: "Do you have parking?",
    answer: "Yes. On-site parking is $24 plus tax a night.",
    category: "Parking",
    status: "due",
    asked: { "24h": 0, "7d": 4, "30d": 12 },
    verifiedOn: "2026-03-01",
  }),
  item({
    question: "What are the pool hours?",
    answer: "The pool is open 9am–10pm.",
    category: "Hours",
    status: "verified",
    asked: { "24h": 1, "7d": 3, "30d": 8 },
    verifiedOn: "2026-11-03",
    variants: ["When does the pool close?"],
  }),
  item({
    question: "What time is breakfast?",
    answer: "Breakfast is served 6:30–10am.",
    category: "Hours",
    status: "verified",
    asked: { "24h": 0, "7d": 5, "30d": 22 },
    verifiedOn: "2026-10-12",
  }),
  item({
    question: "Are your rooms non-smoking?",
    answer: "Yes. The hotel is completely non-smoking.",
    category: "Amenities",
    status: "verified",
    asked: { "24h": 0, "7d": 1, "30d": 6 },
    verifiedOn: "2026-09-02",
    group: "smoke",
  }),
  item({
    question: "Are the rooms non-smoking?",
    answer: "Yes. Smoking is not allowed in any room.",
    category: "Amenities",
    status: "verified",
    asked: { "24h": 0, "7d": 1, "30d": 4 },
    verifiedOn: "2026-08-18",
    group: "smoke",
  }),
  item({
    id: "suite",
    question: "Can you describe the 1 King Studio Suite and other room options?",
    answer: "The 1 King Studio Suite has a walk-in shower. Other room types vary.",
    category: "Amenities",
    status: "verified",
    asked: { "24h": 0, "7d": 2, "30d": 9 },
    verifiedOn: "2026-10-20",
  }),
  item({
    kind: "missed",
    question: "What is the late check-in policy?",
    category: "Policies",
    asked: { "24h": 0, "7d": 1, "30d": 4 },
    lastAsked: "2026-10-24",
    availability: "Permanent",
  }),
  item({
    kind: "missed",
    question: "What is the latest time guests may check out?",
    category: "Policies",
    asked: { "24h": 0, "7d": 0, "30d": 1 },
    lastAsked: "2026-11-01",
  }),
  item({
    kind: "missed",
    question: "Do guests need to notify the hotel about pets before arrival?",
    category: "Policies",
    asked: { "24h": 0, "7d": 0, "30d": 1 },
    lastAsked: "2026-10-31",
  }),
  item({
    kind: "weak",
    question: "For a two queen room, is the shower a walk-in or a tub?",
    category: "Amenities",
    matchedId: "suite",
    lastAsked: "2026-11-03",
    calls: [{ phone: "+1 (215) 350-3025", date: "2026-11-03", resolution: "resolved" }],
  }),
  item({
    kind: "weak",
    question: "Does the Two Queen Studio Suite have a walk-in shower?",
    category: "Amenities",
    matchedId: "suite",
    lastAsked: "2026-11-03",
    calls: [{ phone: "+1 (215) 350-3025", date: "2026-11-03", resolution: "resolved" }],
  }),
];

items.find((row) => row.question.startsWith("Can you describe")).id = "suite";

function byId(id) {
  return items.find((row) => String(row.id) === String(id));
}

function rangeKey() {
  return document.querySelector("[data-range][aria-selected='true']")?.dataset.range || "30d";
}

function askedCount(row) {
  return row.asked?.[rangeKey()] || 0;
}

function formatDay(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function statusIcon(status) {
  if (status === "verified") return DONE;
  if (status === "stale") return STALE;
  return OPEN;
}

function statusHtml(status) {
  return `${statusIcon(status)}${esc(STATUS[status] || "Due soon")}`;
}

function statusControl(row) {
  const label = row.kind === "missed" ? "Missed" : row.kind === "weak" ? "Weak match" : (STATUS[row.status] || "Due soon");
  const icon = row.kind === "faq" ? statusIcon(row.status) : row.kind === "missed" ? OPEN : STALE;
  const tip = `<span class="sheet-status-icon">${icon}</span><span class="tip" aria-hidden="true">${esc(label)}</span>`;
  if (row.kind !== "faq") {
    return `<span class="sheet-status tip-host" aria-label="${esc(label)}">${tip}</span>`;
  }
  return `<button class="sheet-status tip-host" type="button" data-menu-kind="status" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(label)}">${tip}</button>`;
}

function selectedBucket() {
  return document.querySelector(".tabs-bar [data-bucket][aria-selected='true']")?.dataset.bucket || "all";
}

function selectedCategories() {
  return [...filterMenu.querySelectorAll("[data-filter-pick][aria-checked='true']")].map((node) => node.dataset.value);
}

function inBucket(row, bucket) {
  if (bucket === "all") return row.kind === "faq";
  if (bucket === "review") return row.kind === "faq" && row.status !== "verified";
  if (bucket === "missed") return row.kind === "missed";
  if (bucket === "weak") return row.kind === "weak";
  return false;
}

function matchesCategory(row) {
  const chosen = selectedCategories();
  if (!chosen.length) return true;
  return chosen.includes(row.category);
}

function haystack(row) {
  const matched = byId(row.matchedId);
  return [row.question, row.answer, row.category, ...(row.variants || []), matched?.question || ""].join(" ").toLowerCase();
}

function groupCount() {
  const names = items.filter((row) => row.kind === "faq" && row.group).map((row) => row.group);
  return [...new Set(names)].filter((name) => names.filter((value) => value === name).length > 1).length;
}

function members(name) {
  return items.filter((row) => row.kind === "faq" && row.group === name);
}

function buildRow(row) {
  const article = document.createElement("article");
  article.className = "sheet";
  article.dataset.id = String(row.id);
  article.innerHTML = `
    <div class="sheet-clip"><div class="sheet-inner">
      <div class="sheet-line">
        <span class="kb-lead">
          <button class="kb-select" type="button" data-select role="checkbox" aria-checked="false" aria-label="Select row"><svg class="i" width="12" height="12" aria-hidden="true"><use href="#i-check"/></svg></button>
          <span data-status></span>
        </span>
        <span class="kb-q" data-q></span>
        <span class="kb-a" data-a></span>
        <span class="col-reserve">
          <button class="kb-cat" type="button" data-menu-kind="category" aria-haspopup="menu" aria-expanded="false"><span data-cat></span>${CHEV}</button>
          <span class="fit-label sizer-chip" aria-hidden="true"><span>Amenities</span></span>
        </span>
        <span data-metric></span>
      </div>
    </div></div>`;
  row.el = article;
  paintRow(row);
  return article;
}

function paintRow(row) {
  const article = row.el;
  if (!article) return;
  const bucket = selectedBucket();
  const question = article.querySelector("[data-q]");
  const answer = article.querySelector("[data-a]");
  const category = article.querySelector("[data-cat]");
  const catButton = article.querySelector(".kb-cat");
  const metric = article.querySelector("[data-metric]");
  const status = article.querySelector("[data-status]");
  const box = article.querySelector("[data-select]");
  question.textContent = row.question.trim() || "Question";
  question.classList.toggle("is-empty", !row.question.trim());
  if (bucket === "weak") {
    const matched = byId(row.matchedId);
    answer.textContent = matched?.question || "—";
    answer.classList.toggle("is-empty", !matched);
  } else if (bucket === "missed" || !row.answer.trim()) {
    answer.textContent = row.kind === "faq" && !row.answer.trim() ? "New answer" : "—";
    answer.classList.add("is-empty");
  } else {
    answer.textContent = row.answer;
    answer.classList.remove("is-empty");
  }
  category.textContent = row.category || "—";
  catButton.classList.toggle("is-empty", !row.category);
  status.innerHTML = statusControl(row);
  box.setAttribute("aria-checked", selected.has(String(row.id)) ? "true" : "false");
  if (bucket === "weak") {
    metric.className = "kb-metric";
    metric.innerHTML = `<span class="kb-when">${esc(formatDay(row.lastAsked))}</span><a class="kb-call-link" href="calls.html">Open call</a>`;
  } else {
    metric.className = "kb-asked";
    metric.textContent = String(askedCount(row));
  }
}

function sortSheet() {
  const rows = items.filter((row) => row.el);
  rows.sort((a, b) => {
    const aNew = a.kind === "faq" && !a.question.trim();
    const bNew = b.kind === "faq" && !b.question.trim();
    if (aNew !== bNew) return aNew ? -1 : 1;
    return askedCount(b) - askedCount(a) || String(a.question).localeCompare(String(b.question));
  });
  for (const row of rows) sheet.append(row.el);
}

function paintHeads() {
  const labels = HEADS[selectedBucket()] || HEADS.all;
  ["status", "question", "answer", "category", "asked"].forEach((key, index) => {
    const node = document.querySelector(`[data-head="${key}"]`);
    if (!node) return;
    const label = node.querySelector("[data-head-label]");
    if (label) label.textContent = labels[index];
    else node.textContent = labels[index];
  });
}

function visibleRows() {
  return items.filter((row) => row.el && !row.el.hidden && inBucket(row, selectedBucket()));
}

function paintSelect() {
  const rows = visibleRows();
  const on = rows.filter((row) => selected.has(String(row.id))).length;
  const button = document.querySelector("[data-select-page]");
  if (button) button.setAttribute("aria-checked", on === 0 ? "false" : on === rows.length ? "true" : "mixed");
  const verify = document.querySelector("[data-verify]");
  if (verify) {
    const can = [...selected].some((id) => {
      const row = byId(id);
      return row && row.kind === "faq" && row.status !== "verified";
    });
    verify.hidden = !can;
  }
}

function applyFilters() {
  const bucket = selectedBucket();
  page.dataset.bucket = bucket;
  paintHeads();
  const query = (searchInput?.value || "").trim().toLowerCase();
  const totals = { all: 0, review: 0, missed: 0, weak: 0, recommendations: groupCount() };
  let visible = 0;
  let listed = 0;
  sortSheet();
  for (const row of items) {
    if (!row.el) continue;
    const filtered = matchesCategory(row);
    const leaving = row.el.classList.contains("is-leaving");
    if (filtered && !leaving) {
      if (row.kind === "faq") totals.all += 1;
      if (row.kind === "faq" && row.status !== "verified") totals.review += 1;
      if (row.kind === "missed") totals.missed += 1;
      if (row.kind === "weak") totals.weak += 1;
    }
    const inList = filtered && inBucket(row, bucket) && !leaving;
    if (inList) listed += 1;
    const show = inList && (!query || haystack(row).includes(query));
    if (!leaving) row.el.hidden = !show;
    else if (!inBucket(row, bucket)) row.el.hidden = true;
    if (show && !row.el.hidden) visible += 1;
    if (show) paintRow(row);
  }
  if (empty) {
    empty.hidden = bucket === "recommendations" || visible !== 0;
    empty.textContent = bucket === "weak" ? "No calls" : bucket === "missed" ? "No questions" : "No answers";
  }
  const faqs = items.filter((row) => row.kind === "faq" && matchesCategory(row)).length;
  if (count) count.textContent = String(faqs);
  if (sheetCount) sheetCount.textContent = `Showing ${visible} of ${listed}`;
  for (const tab of tabs) {
    const badge = tab.querySelector("[data-bucket-count]");
    if (!badge) continue;
    const value = totals[tab.dataset.bucket] || 0;
    badge.textContent = String(value);
    badge.classList.toggle("is-live", tab.dataset.bucket === "missed" && value > 0);
  }
  paintHealth();
  paintSelect();
  paintRecs();
  if (sideItem && sideItem.el && !sideItem.el.classList.contains("is-open") && sideMode === "record" && !side.hidden) {
    /* keep the open panel while its row is filtered out */
  }
}

function paintHealth() {
  const verified = items.filter((row) => row.kind === "faq" && row.status === "verified").length;
  const due = items.filter((row) => row.kind === "faq" && row.status === "due").length;
  const stale = items.filter((row) => row.kind === "faq" && row.status === "stale").length;
  const missed = items.filter((row) => row.kind === "missed").length;
  const weak = items.filter((row) => row.kind === "weak").length;
  const review = due + stale;
  const total = verified + review + missed + weak;
  const score = total ? Math.round((100 * verified) / total) : 100;
  const strong = score >= 80;
  const host = document.querySelector("[data-health]");
  host.dataset.level = strong ? "strong" : "work";
  host.querySelector("[data-score]").textContent = String(score);
  host.querySelector("[data-health-word]").textContent = strong ? "Strong" : "Needs work";
  host.querySelector("[data-due]").textContent = String(due);
  host.querySelector("[data-stale]").textContent = String(stale);
  host.querySelector("[data-missed]").textContent = String(missed);
  host.querySelector("[data-weak]").textContent = String(weak);
  host.querySelector("[data-gauge]")?.setAttribute("stroke-dasharray", `${score} 100`);
  const line = host.querySelector("[data-health-line]");
  if (missed) line.textContent = `Answer ${missed} missed ${missed === 1 ? "question" : "questions"}`;
  else if (review) line.textContent = `${review} ${review === 1 ? "answer needs" : "answers need"} review`;
  else line.textContent = "Knowledge is in good shape";
}

function paintRecs() {
  const names = [...new Set(items.filter((row) => row.group).map((row) => row.group))].filter((name) => members(name).length > 1);
  groupsEl.replaceChildren();
  if (!names.length) {
    const note = document.createElement("p");
    note.textContent = "No answers";
    groupsEl.append(note);
    return;
  }
  for (const name of names) {
    const rows = members(name);
    const block = document.createElement("div");
    block.className = "kb-group";
    block.innerHTML = `
      <h3>${esc(rows[0].question)}</h3>
      <p>${rows.length} answers. Review before combining.</p>
      <div class="kb-actions">
        <button class="btn btn-secondary" type="button" data-review="${esc(name)}">Review</button>
        <button class="btn btn-secondary" type="button" data-dismiss-group="${esc(name)}">Dismiss</button>
      </div>`;
    groupsEl.append(block);
  }
}

function paintChips() {
  chips.replaceChildren();
  for (const choice of filterMenu.querySelectorAll("[data-filter-pick][aria-checked='true']")) {
    const button = document.createElement("button");
    button.className = "chip chip-filter";
    button.type = "button";
    button.innerHTML = `<span class="chip-k">Category</span>: ${esc(choice.dataset.value)} <svg class="i x" width="10" height="10"><use href="#i-plus"/></svg>`;
    button.addEventListener("click", () => {
      choice.setAttribute("aria-checked", "false");
      paintChips();
      applyFilters();
    });
    chips.append(button);
  }
}

function setField(node, value) {
  if (node && node.value !== value) node.value = value;
}

function paintSide(row) {
  if (!row) return;
  const combine = sideMode === "combine";
  const missed = row.kind === "missed";
  const question = side.querySelector("[data-question]");
  const main = side.querySelector("[data-main]");
  question.hidden = combine;
  main.hidden = !combine;
  if (combine) {
    side.querySelector("[data-main-label]").textContent = row.question;
  } else {
    setField(question, row.question);
  }
  const status = side.querySelector("[data-side-status]");
  status.hidden = missed || combine;
  status.innerHTML = `<span data-side-status-icon>${statusIcon(row.status)}</span><span>${esc(STATUS[row.status] || "Due soon")}</span>${CHEV}`;
  const key = rangeKey();
  const times = askedCount(row);
  const meta = side.querySelector("[data-meta]");
  if (missed) {
    meta.innerHTML = `Asked <b>${times}×</b> in the last ${RANGE_LABEL[key]}${row.lastAsked ? ` · Last ${esc(formatDay(row.lastAsked))}` : ""}`;
  } else {
    const verified = row.verifiedOn ? `Verified ${formatDay(row.verifiedOn)}` : "Never verified";
    meta.innerHTML = `Asked <b>${times}×</b> in the last ${RANGE_LABEL[key]} · ${esc(verified)}`;
  }
  setField(side.querySelector("[data-answer]"), row.answer);
  const draft = side.querySelector("[data-draft]");
  draft.hidden = !row.draft;
  draft.textContent = row.draft;
  side.querySelector("[data-draft-btn]").hidden = !missed;
  side.querySelector("[data-combine]").hidden = !combine;
  side.querySelector("[data-menu-kind='link']").hidden = !missed;
  const phrasing = side.querySelector("[data-add-phrasing]");
  const weakNote = side.querySelector("[data-weak]");
  const showWeak = sideMode === "record" && weakSource && byId(weakSource)?.matchedId === row.id;
  phrasing.hidden = !showWeak;
  weakNote.hidden = !showWeak;
  if (showWeak) {
    const guest = byId(weakSource);
    weakNote.textContent = `A guest asked “${guest?.question || ""}” and Lance used this answer.`;
    phrasing.hidden = !guest || row.variants.includes(guest.question);
  }
  paintVariants(row, combine);
  paintOriginals(combine ? members(combineGroup) : []);
  paintCalls(row);
  const category = side.querySelector("[data-side-category]");
  category.textContent = row.category || "—";
  category.closest("button").classList.toggle("is-empty", !row.category);
  side.querySelector("[data-side-availability]").textContent = row.availability || "Permanent";
  const verified = side.querySelector("[data-verified]");
  verified.textContent = row.verifiedOn ? formatDay(row.verifiedOn) : "—";
  verified.classList.toggle("kb-dash", !row.verifiedOn);
}

function paintVariants(row, combine) {
  const list = side.querySelector("[data-variants]");
  list.replaceChildren();
  const values = combine ? members(combineGroup).filter((other) => other !== row).map((other) => other.question) : row.variants;
  for (const value of values) {
    const line = document.createElement("div");
    line.className = "kb-variant";
    if (combine) {
      line.innerHTML = `<span>${esc(value)}</span>`;
    } else {
      line.innerHTML = `<span>${esc(value)}</span><button class="note-more" type="button" data-remove-variant="${esc(value)}" aria-label="Remove phrasing"><svg class="i" width="14" height="14"><use href="#i-close"/></svg></button>`;
    }
    list.append(line);
  }
}

function paintOriginals(rows) {
  const host = side.querySelector("[data-originals]");
  host.replaceChildren();
  for (const row of rows) {
    const line = document.createElement("p");
    line.className = "kb-original";
    line.innerHTML = `<b>${esc(row.question)}</b> — ${esc(row.answer)}`;
    host.append(line);
  }
}

function paintCalls(row) {
  const host = side.querySelector("[data-calls]");
  host.replaceChildren();
  if (!row.calls?.length) {
    const note = document.createElement("p");
    note.className = "kb-help";
    note.textContent = "No calls";
    host.append(note);
    return;
  }
  const list = document.createElement("ul");
  list.className = "kb-calls";
  for (const call of row.calls) {
    const line = document.createElement("li");
    line.innerHTML = `<span>${esc(call.phone)}</span><span class="kb-when">${esc(formatDay(call.date))}</span><span class="kb-resolution" data-resolution="${esc(call.resolution)}">${esc(RESOLVE[call.resolution] || call.resolution)}</span>`;
    list.append(line);
  }
  host.append(list);
}

function setOpen(row, open) {
  if (!row) return;
  for (const other of items) {
    if (other !== row) other.el?.classList.remove("is-open");
  }
  row.el?.classList.toggle("is-open", open);
  if (open) {
    sideItem = row;
    sideMode = "record";
    side.hidden = false;
    paintSide(row);
    return;
  }
  if (sideItem === row) {
    sideItem = null;
    weakSource = null;
    side.hidden = true;
  }
}

function leaveRow(row) {
  if (!row?.el) {
    applyFilters();
    return;
  }
  if (reduceMotion) {
    applyFilters();
    return;
  }
  row.el.classList.add("is-leaving");
  const clip = row.el.querySelector(".sheet-clip");
  let gone = false;
  const finish = (event) => {
    if (gone) return;
    if (event && event.propertyName !== "grid-template-rows") return;
    gone = true;
    row.el.hidden = true;
    row.el.classList.remove("is-leaving");
    applyFilters();
  };
  clip?.addEventListener("transitionend", finish);
  window.setTimeout(finish, 260);
}

function removeItem(row) {
  const index = items.indexOf(row);
  if (index >= 0) items.splice(index, 1);
  if (sideItem === row) {
    sideItem = null;
    weakSource = null;
    side.hidden = true;
    row.el?.classList.remove("is-open");
  }
  if (!row.el) {
    applyFilters();
    return;
  }
  if (reduceMotion) {
    row.el.remove();
    applyFilters();
    return;
  }
  row.el.classList.add("is-leaving");
  const clip = row.el.querySelector(".sheet-clip");
  let gone = false;
  const finish = (event) => {
    if (gone) return;
    if (event && event.propertyName !== "grid-template-rows") return;
    gone = true;
    selected.delete(String(row.id));
    row.el.remove();
    applyFilters();
  };
  clip?.addEventListener("transitionend", finish);
  window.setTimeout(finish, 280);
}

function setStatus(row, next) {
  if (!STATUS[next] || row.kind !== "faq") return;
  window.clearTimeout(row._hold);
  if (next === "verified" && !row.answer.trim()) {
    setOpen(row, true);
    side.querySelector("[data-answer]")?.focus();
    return;
  }
  const bucket = selectedBucket();
  const leaves = bucket === "review" && next === "verified" && row.status !== "verified";
  row.status = next;
  if (next === "verified") row.verifiedOn = TODAY;
  paintRow(row);
  if (sideItem === row) paintSide(row);
  if (!leaves) {
    applyFilters();
    return;
  }
  row._hold = window.setTimeout(() => leaveRow(row), COMPLETE_HOLD);
}

function convertMissed(row) {
  if (row.kind !== "missed" || !row.answer.trim()) return;
  row.kind = "faq";
  row.status = "due";
  paintRow(row);
  if (sideItem === row) paintSide(row);
  if (selectedBucket() === "missed") leaveRow(row);
  else applyFilters();
}

function closeFilterSubs() {
  for (const sub of filterMenu.querySelectorAll(".filter-sub")) sub.hidden = true;
  for (const button of filterMenu.querySelectorAll("[data-filter-cat]")) button.setAttribute("aria-expanded", "false");
}

function openFilterSub(button) {
  const sub = button.parentElement.querySelector(".filter-sub");
  if (!sub) return;
  if (button.getAttribute("aria-expanded") === "true" && !sub.hidden) return;
  closeFilterSubs();
  button.setAttribute("aria-expanded", "true");
  sub.hidden = false;
  sub.classList.remove("is-left");
  if (sub.getBoundingClientRect().right > window.innerWidth - 8) sub.classList.add("is-left");
}

function closePanels(except) {
  if (filterMenu && filterMenu !== except) {
    filterMenu.querySelector("[data-filter-button]")?.setAttribute("aria-expanded", "false");
    const panel = filterMenu.querySelector(".filter-menu");
    if (panel) panel.hidden = true;
    closeFilterSubs();
  }
  if (fieldMenu) fieldMenu.hidden = true;
  if (rowMenu) rowMenu.hidden = true;
  if (fieldButton) fieldButton.setAttribute("aria-expanded", "false");
  fieldButton = null;
  document.querySelector("[data-side-more]")?.setAttribute("aria-expanded", "false");
}

function placePanel(panel, x, y) {
  panel.hidden = false;
  panel.style.left = "0px";
  panel.style.top = "0px";
  const box = panel.getBoundingClientRect();
  panel.style.left = `${Math.max(8, Math.min(x, window.innerWidth - box.width - 8))}px`;
  panel.style.top = `${Math.max(8, Math.min(y, window.innerHeight - box.height - 8))}px`;
}

function menuButton(kind, value, label, selected) {
  return `<button class="menu-item" type="button" role="menuitemradio" data-kind="${kind}" data-value="${esc(value)}" aria-checked="${value === selected ? "true" : "false"}">${label}${CHECK}</button>`;
}

function openFieldMenu(button) {
  const row = button.closest(".sheet") ? byId(button.closest(".sheet").dataset.id) : sideItem;
  const kind = button.dataset.menuKind;
  if (!row && kind !== "main") return;
  const open = button.getAttribute("aria-expanded") === "true";
  closePanels();
  if (open) return;
  menuTarget = row;
  fieldButton = button;
  button.setAttribute("aria-expanded", "true");
  if (kind === "status") {
    fieldMenu.classList.add("is-status");
    fieldMenu.innerHTML = Object.keys(STATUS).map((key) => menuButton("status", key, `<span class="kb-status-option">${statusIcon(key)}${esc(STATUS[key])}</span>`, row.status)).join("");
  } else if (kind === "category") {
    fieldMenu.classList.remove("is-status");
    fieldMenu.innerHTML = CATS.map((cat) => menuButton("category", cat, esc(cat), row.category)).join("");
  } else if (kind === "availability") {
    fieldMenu.classList.remove("is-status");
    fieldMenu.innerHTML = AVAIL.map((value) => menuButton("availability", value, esc(value), row.availability)).join("");
  } else if (kind === "main") {
    fieldMenu.classList.remove("is-status");
    fieldMenu.innerHTML = members(combineGroup).map((other) => menuButton("main", String(other.id), esc(other.question), String(row.id))).join("");
  } else if (kind === "link") {
    fieldMenu.classList.remove("is-status");
    const faqs = items.filter((other) => other.kind === "faq");
    fieldMenu.innerHTML = faqs.map((other) => menuButton("link", String(other.id), esc(other.question), "")).join("");
  }
  const box = button.getBoundingClientRect();
  placePanel(fieldMenu, box.left, box.bottom + 4);
}

function openRowMenu(x, y, row, more) {
  menuTarget = row;
  closePanels();
  if (more) more.setAttribute("aria-expanded", "true");
  const label = rowMenu.querySelector("[data-delete-label]");
  if (label) label.textContent = row?.kind === "missed" || row?.kind === "weak" ? "Dismiss" : "Delete";
  placePanel(rowMenu, x, y);
  if (!more) return;
  const box = more.getBoundingClientRect();
  const width = rowMenu.getBoundingClientRect().width;
  placePanel(rowMenu, box.right - width, box.bottom + 4);
}

function askDelete(row) {
  pendingDelete = row;
  const noun = row.kind === "faq" ? "answer" : "question";
  confirmDialog.querySelector("#confirm-title").textContent = `Delete this ${noun}?`;
  const name = row.question.trim() || "This question";
  confirmDialog.querySelector("p").textContent = `“${name}” will be permanently removed for the whole team.`;
  confirmDialog.classList.remove("is-closing");
  confirmDialog.showModal();
}

function closeConfirm() {
  if (!confirmDialog?.open || confirmDialog.classList.contains("is-closing")) return;
  if (reduceMotion) {
    confirmDialog.close();
    return;
  }
  confirmDialog.classList.add("is-closing");
  const card = confirmDialog.querySelector(".confirm");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    confirmDialog.classList.remove("is-closing");
    confirmDialog.close();
  };
  card?.addEventListener("animationend", finish, { once: true });
  window.setTimeout(finish, 240);
}

function addQuestion() {
  const row = item({ question: "", answer: "", category: "", status: "due", availability: "Permanent" });
  items.unshift(row);
  const article = buildRow(row);
  article.classList.add("is-entering");
  sheet.prepend(article);
  for (const tab of tabs) tab.setAttribute("aria-selected", tab.dataset.bucket === "all" ? "true" : "false");
  applyFilters();
  setOpen(row, true);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => article.classList.remove("is-entering"));
  });
  side.querySelector("[data-question]")?.focus();
}

function openCombine(name) {
  const rows = members(name);
  if (rows.length < 2) return;
  combineGroup = name;
  sideMode = "combine";
  sideItem = rows[0];
  weakSource = null;
  for (const other of items) other.el?.classList.remove("is-open");
  rows.forEach((row) => row.el?.classList.add("is-open"));
  side.hidden = false;
  paintSide(rows[0]);
}

function commitCombine() {
  const rows = members(combineGroup);
  const main = sideItem;
  if (!main || rows.length < 2) return;
  main.answer = side.querySelector("[data-answer]").value;
  for (const other of rows) {
    if (other === main) continue;
    if (other.question && !main.variants.includes(other.question)) main.variants.push(other.question);
    for (const variant of other.variants) {
      if (!main.variants.includes(variant)) main.variants.push(variant);
    }
    other.group = null;
    removeItem(other);
  }
  main.group = null;
  sideMode = "record";
  paintRow(main);
  paintSide(main);
  applyFilters();
}

function findGaps() {
  const gaps = [
    ["Is there an airport shuttle?", "Amenities", 6],
    ["Do you have cribs?", "Amenities", 4],
    ["What time does the gym close?", "Hours", 9],
  ];
  for (const [question, category, times] of gaps) {
    if (items.some((row) => row.question === question)) continue;
    const row = item({
      kind: "missed",
      question,
      category,
      asked: { "24h": 0, "7d": 1, "30d": times },
      lastAsked: TODAY,
    });
    items.push(row);
    sheet.append(buildRow(row));
  }
  document.querySelector("[data-gaps]").hidden = true;
  for (const tab of tabs) tab.setAttribute("aria-selected", tab.dataset.bucket === "missed" ? "true" : "false");
  applyFilters();
}

for (const row of items) sheet.append(buildRow(row));
applyFilters();

searchInput?.addEventListener("input", applyFilters);
searchInput?.form?.querySelector(".clear")?.addEventListener("click", () => {
  window.setTimeout(applyFilters, 0);
});
document.querySelector("[data-new]")?.addEventListener("click", (event) => {
  event.stopPropagation();
  addQuestion();
});
document.querySelector("[data-gaps]")?.addEventListener("click", findGaps);

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const other of tabs) other.setAttribute("aria-selected", other === tab ? "true" : "false");
    closePanels();
    const bucket = tab.dataset.bucket;
    if (sideItem && (sideMode === "combine" || !inBucket(sideItem, bucket))) {
      const open = sideItem;
      sideMode = "record";
      setOpen(open, false);
    }
    applyFilters();
  });
}

for (const range of document.querySelectorAll("[data-range]")) {
  range.addEventListener("click", () => window.setTimeout(() => {
    applyFilters();
    if (sideItem) paintSide(sideItem);
  }, 0));
}

filterMenu?.addEventListener("pointerover", (event) => {
  const cat = event.target.closest("[data-filter-cat]");
  if (!cat || filterMenu.querySelector(".filter-menu")?.hidden) return;
  openFilterSub(cat);
});

filterMenu?.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest("[data-filter-button]");
  if (button) {
    const open = button.getAttribute("aria-expanded") === "true";
    closePanels(filterMenu);
    button.setAttribute("aria-expanded", open ? "false" : "true");
    filterMenu.querySelector(".filter-menu").hidden = open;
    if (open) closeFilterSubs();
    return;
  }
  const cat = event.target.closest("[data-filter-cat]");
  if (cat) {
    openFilterSub(cat);
    return;
  }
  const choice = event.target.closest("[data-filter-pick]");
  if (!choice) return;
  const on = choice.getAttribute("aria-checked") === "true";
  choice.setAttribute("aria-checked", on ? "false" : "true");
  paintChips();
  applyFilters();
});

function toggleSelect(row, on) {
  const id = String(row.id);
  if (on) selected.add(id);
  else selected.delete(id);
  paintRow(row);
  paintSelect();
}

document.querySelector("[data-select-page]")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const rows = visibleRows();
  const all = rows.length > 0 && rows.every((row) => selected.has(String(row.id)));
  for (const row of rows) toggleSelect(row, !all);
});

document.querySelector("[data-verify]")?.addEventListener("click", () => {
  for (const id of [...selected]) {
    const row = byId(id);
    if (row && row.kind === "faq" && row.status !== "verified") setStatus(row, "verified");
  }
  paintSelect();
});

sheet.addEventListener("click", (event) => {
  const select = event.target.closest("[data-select]");
  if (select) {
    const row = byId(select.closest(".sheet")?.dataset.id);
    if (row) toggleSelect(row, !selected.has(String(row.id)));
    return;
  }
  if (event.target.closest("a")) return;
  const button = event.target.closest("button");
  if (button?.dataset.menuKind) {
    openFieldMenu(button);
    return;
  }
  if (button) return;
  const row = byId(event.target.closest(".sheet")?.dataset.id);
  if (!row) return;
  if (row.kind === "weak") {
    const faq = byId(row.matchedId);
    if (!faq) return;
    weakSource = row.id;
    setOpen(faq, true);
    return;
  }
  weakSource = null;
  setOpen(row, !row.el.classList.contains("is-open"));
  if (row.kind === "missed" && row.el.classList.contains("is-open")) side.querySelector("[data-answer]")?.focus();
});

side.addEventListener("click", (event) => {
  if (event.target.closest("[data-side-back]")) {
    if (sideItem) setOpen(sideItem, false);
    sideMode = "record";
    return;
  }
  const button = event.target.closest("[data-menu-kind]");
  if (button) {
    openFieldMenu(button);
    return;
  }
  if (event.target.closest("[data-side-more]")) {
    const more = side.querySelector("[data-side-more]");
    const open = more.getAttribute("aria-expanded") === "true";
    if (open) closePanels();
    else if (sideItem) openRowMenu(0, 0, sideItem, more);
    return;
  }
  const remove = event.target.closest("[data-remove-variant]");
  if (remove && sideItem) {
    sideItem.variants = sideItem.variants.filter((value) => value !== remove.dataset.removeVariant);
    paintSide(sideItem);
  }
});

side.querySelector("[data-question]")?.addEventListener("input", (event) => {
  if (!sideItem || sideMode === "combine") return;
  sideItem.question = event.target.value;
  paintRow(sideItem);
});

side.querySelector("[data-answer]")?.addEventListener("input", (event) => {
  if (!sideItem || sideMode === "combine") return;
  sideItem.answer = event.target.value;
  paintRow(sideItem);
  convertMissed(sideItem);
});

side.querySelector("[data-variant-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!sideItem || sideMode === "combine") return;
  const input = event.target.querySelector("input");
  const text = input.value.trim();
  if (!text || sideItem.variants.includes(text)) return;
  sideItem.variants.push(text);
  input.value = "";
  paintSide(sideItem);
});

side.querySelector("[data-draft-btn]")?.addEventListener("click", () => {
  if (!sideItem) return;
  sideItem.answer = "You can check in late. Call ahead and the front desk will hold the room.";
  sideItem.draft = "Drafted from 3 answers. Check it before verifying.";
  paintRow(sideItem);
  paintSide(sideItem);
  convertMissed(sideItem);
});

side.querySelector("[data-add-phrasing]")?.addEventListener("click", () => {
  const guest = byId(weakSource);
  if (!sideItem || !guest) return;
  if (!sideItem.variants.includes(guest.question)) sideItem.variants.push(guest.question);
  removeItem(guest);
  weakSource = null;
  paintSide(sideItem);
});

side.querySelector("[data-combine]")?.addEventListener("click", commitCombine);

groupsEl.addEventListener("click", (event) => {
  const review = event.target.closest("[data-review]");
  if (review) {
    openCombine(review.dataset.review);
    return;
  }
  const dismiss = event.target.closest("[data-dismiss-group]");
  if (!dismiss) return;
  for (const row of members(dismiss.dataset.dismissGroup)) row.group = null;
  if (sideMode === "combine") setOpen(sideItem, false);
  applyFilters();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#field-menu")) {
    const choice = event.target.closest("[data-kind]");
    if (choice && menuTarget) {
      if (choice.dataset.kind === "status") setStatus(menuTarget, choice.dataset.value);
      if (choice.dataset.kind === "category") {
        menuTarget.category = choice.dataset.value;
        paintRow(menuTarget);
        if (sideItem === menuTarget || sideMode === "combine") paintSide(sideItem);
        applyFilters();
      }
      if (choice.dataset.kind === "availability") {
        menuTarget.availability = choice.dataset.value;
        paintSide(menuTarget);
      }
      if (choice.dataset.kind === "main") {
        const next = byId(choice.dataset.value);
        if (next) {
          sideItem = next;
          paintSide(next);
        }
      }
      if (choice.dataset.kind === "link") {
        const faq = byId(choice.dataset.value);
        if (faq && menuTarget?.kind === "missed") {
          if (menuTarget.question && !faq.variants.includes(menuTarget.question)) faq.variants.push(menuTarget.question);
          removeItem(menuTarget);
        }
      }
    }
    if (choice) closePanels();
    return;
  }
  if (event.target.closest("#row-menu")) {
    if (event.target.closest("[data-menu-delete]") && menuTarget) {
      askDelete(menuTarget);
      closePanels();
    }
    return;
  }
  if (event.target.closest("[data-filter-menu], #kb-side, .sheet, .confirm-dialog")) return;
  closePanels();
  if (sideItem && !side.hidden && !event.target.closest(".kb-recs")) setOpen(sideItem, false);
});

document.addEventListener("contextmenu", (event) => {
  const line = event.target.closest(".sheet-line");
  if (!line) return;
  event.preventDefault();
  openRowMenu(event.clientX, event.clientY, byId(line.closest(".sheet").dataset.id));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanels();
    if (confirmDialog?.open) closeConfirm();
  }
});

confirmDialog?.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-confirm]");
  if (choice?.dataset.confirm === "delete" && pendingDelete) {
    const target = pendingDelete;
    pendingDelete = null;
    removeItem(target);
  }
  if (choice) closeConfirm();
});

confirmDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  pendingDelete = null;
  closeConfirm();
});

const lanceInput = document.querySelector(".lance input");
for (const chip of document.querySelectorAll("[data-suggest]")) {
  chip.addEventListener("click", () => {
    if (!lanceInput) return;
    lanceInput.value = chip.textContent.trim();
    lanceInput.dispatchEvent(new Event("input", { bubbles: true }));
    lanceInput.focus();
  });
}

const collapseButton = document.querySelector(".side-top [data-side-collapse]");
const lanceCollapse = document.querySelector("#lance [data-lance-collapse]");
const SIDE_OPEN_AT = 1564;
const LANCE_OPEN_AT = 1341;
let sideChosen = false;
let sideHeldOpen = false;
let lanceChosen = false;
let lanceHeldOpen = false;
try {
  sideChosen = sessionStorage.getItem("side-chosen") === "1";
  sideHeldOpen = sessionStorage.getItem("side-held-open") === "1";
} catch (error) {}

function rememberSide() {
  try {
    sessionStorage.setItem("side-chosen", sideChosen ? "1" : "0");
    sessionStorage.setItem("side-held-open", sideHeldOpen ? "1" : "0");
  } catch (error) {}
}

function setSideCollapsed(collapsed) {
  if (document.body.classList.contains("is-side-collapsed") !== collapsed) {
    document.body.classList.toggle("is-side-collapsed", collapsed);
  }
  collapseButton?.setAttribute("aria-expanded", collapsed ? "false" : "true");
  collapseButton?.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
}

function setLanceCollapsed(collapsed) {
  if (document.body.classList.contains("is-lance-collapsed") === collapsed) return;
  document.body.classList.toggle("is-lance-collapsed", collapsed);
  lanceCollapse?.setAttribute("aria-expanded", collapsed ? "false" : "true");
  lanceCollapse?.setAttribute("aria-label", collapsed ? "Open chat" : "Collapse chat");
}

function applyPanelLimits() {
  const width = window.innerWidth;
  if (width >= SIDE_OPEN_AT && sideHeldOpen) {
    sideHeldOpen = false;
    rememberSide();
  }
  if (width >= LANCE_OPEN_AT) lanceHeldOpen = false;
  setSideCollapsed((width < SIDE_OPEN_AT && !sideHeldOpen) || sideChosen);
  setLanceCollapsed((width < LANCE_OPEN_AT && !lanceHeldOpen) || lanceChosen);
}

collapseButton?.addEventListener("click", () => {
  const next = !document.body.classList.contains("is-side-collapsed");
  sideChosen = next;
  sideHeldOpen = !next && window.innerWidth < SIDE_OPEN_AT;
  rememberSide();
  setSideCollapsed(next);
});

lanceCollapse?.addEventListener("click", () => {
  const next = !document.body.classList.contains("is-lance-collapsed");
  lanceChosen = next;
  lanceHeldOpen = !next && window.innerWidth < LANCE_OPEN_AT;
  setLanceCollapsed(next);
});

applyPanelLimits();
window.addEventListener("resize", applyPanelLimits);
