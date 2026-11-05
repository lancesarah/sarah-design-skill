const rows = [...document.querySelectorAll(".brief-list [data-note]")];
const searches = [...document.querySelectorAll("[data-note-search] input")];
const count = document.querySelector("[data-count]");
const deptTabs = [...document.querySelectorAll(".page-filters [data-dept]")];
const emptyNote = document.querySelector(".brief-empty");
const page = document.querySelector(".notes-page");
const viewButtons = [...document.querySelectorAll(".dev-switch [data-view]")];
let view = "top";

function selectedDept() {
  return deptTabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.dept || "All";
}

function notePanel(title) {
  return document.querySelector(`[data-detail="${CSS.escape(title.dataset.note)}"]`);
}

function searchQuery() {
  const visible = searches.find((input) => input.offsetParent);
  return (visible?.value || searches[0]?.value || "").trim().toLowerCase();
}

function applyFilters() {
  if (rows.length === 0) {
    createNote();
    return;
  }
  const query = searchQuery();
  const dept = selectedDept();
  const totals = {};
  const visible = [];
  for (const title of rows) {
    const rowDept = title.dataset.dept || "";
    totals[rowDept] = (totals[rowDept] || 0) + 1;
    const text = `${title.textContent} ${notePanel(title)?.textContent || ""}`.toLowerCase();
    const match = (!query || text.includes(query)) && (dept === "All" || rowDept === dept);
    title.hidden = !match;
    if (match) visible.push(title);
  }
  const selected = rows.find((title) => title.getAttribute("aria-selected") === "true" && !title.hidden);
  if (selected) selectNote(selected);
  else if (visible[0]) selectNote(visible[0]);
  else {
    for (const panel of document.querySelectorAll("[data-detail]")) panel.hidden = true;
    if (emptyNote) emptyNote.hidden = false;
  }
  if (count) count.textContent = String(rows.length);
  for (const tab of deptTabs) {
    const badge = tab.querySelector("[data-dept-count]");
    if (!badge) continue;
    badge.textContent = tab.dataset.dept === "All" ? String(rows.length) : String(totals[tab.dataset.dept] || 0);
  }
}

for (const input of searches) {
  input.addEventListener("input", () => {
    for (const other of searches) if (other !== input) other.value = input.value;
    applyFilters();
  });
}
for (const tab of deptTabs) {
  tab.addEventListener("click", () => {
    for (const other of deptTabs) other.setAttribute("aria-selected", other === tab ? "true" : "false");
    applyFilters();
  });
}

function selectNote(title) {
  for (const other of rows) other.setAttribute("aria-selected", other === title ? "true" : "false");
  const id = title.dataset.note;
  for (const panel of document.querySelectorAll("[data-detail]")) {
    panel.hidden = panel.dataset.detail !== id;
  }
  if (emptyNote) emptyNote.hidden = true;
  syncCommentLock(notePanel(title));
  layoutOpenNote();
}

function mountScrolls(article) {
  const main = article.querySelector(".brief-main");
  const replies = article.querySelector(".brief-replies");
  if (!main || !replies) return;
  if (!main.querySelector(".note-scroll")) {
    const content = main.querySelector(".note-draft, .brief-body");
    if (content) {
      const frame = document.createElement("div");
      const body = document.createElement("div");
      frame.className = "scroll-fade note-scroll";
      body.className = "note-scroll-body";
      content.before(frame);
      body.append(content);
      frame.append(body);
      edgeFade(body, "y");
    }
  }
  if (!replies.querySelector(".comment-scroll")) {
    const frame = document.createElement("div");
    const body = document.createElement("div");
    const form = replies.querySelector(".msg");
    frame.className = "scroll-fade comment-scroll";
    body.className = "comment-scroll-body";
    for (const comment of [...replies.querySelectorAll(":scope > .comment")]) body.append(comment);
    if (form) form.before(frame);
    else replies.append(frame);
    frame.append(body);
    edgeFade(body, "y");
    new MutationObserver(() => layoutOpenNote()).observe(body, { childList: true });
  }
}

function layoutOpenNote() {
  const read = document.querySelector(".brief-read");
  const article = read?.querySelector(".detail:not([hidden])");
  if (!read || !article) return;
  mountScrolls(article);
  const replies = article.querySelector(".brief-replies");
  const field = article.querySelector(".note-draft");
  const noteBody = article.querySelector(".note-scroll-body");
  const commentBody = article.querySelector(".comment-scroll-body");
  article.style.removeProperty("--replies-h");
  replies?.classList.remove("is-pinned");
  if (field) {
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }
  if (!replies || !noteBody) return;
  const noteFrame = noteBody.parentElement;
  const main = article.querySelector(".brief-main");
  noteBody.style.maxHeight = "";
  noteFrame.style.maxHeight = "";
  if (commentBody) commentBody.style.maxHeight = "";
  read.classList.remove("is-docked");
  const repliesStyle = getComputedStyle(replies);
  const margin = parseFloat(repliesStyle.marginTop) + parseFloat(repliesStyle.marginBottom);
  const gap = parseFloat(repliesStyle.rowGap || repliesStyle.gap) || 0;
  const heading = replies.querySelector("h3")?.getBoundingClientRect().height || 0;
  const form = replies.querySelector(".msg")?.getBoundingClientRect().height || 0;
  const commentFrame = replies.querySelector(".comment-scroll");
  const commentsOpen = commentFrame && getComputedStyle(commentFrame).display !== "none";
  const chrome = margin + heading + form + gap * (commentsOpen ? 2 : 1);
  const lane = commentsOpen ? 49 : 0;
  const available = main.clientHeight;
  const noteContent = noteBody.scrollHeight;
  const noteCap = Math.max(0, available - chrome - lane);
  if (noteContent > noteCap + 1) {
    const cap = `${Math.round(noteCap)}px`;
    noteBody.style.maxHeight = cap;
    noteFrame.style.maxHeight = cap;
    read.classList.add("is-docked");
  }
  const noteUsed = Math.min(noteContent, noteCap);
  const commentRoom = Math.max(lane, available - chrome - noteUsed);
  const commentContent = commentBody ? commentBody.scrollHeight : 0;
  if (commentBody && commentContent > commentRoom + 1) {
    commentBody.style.maxHeight = `${Math.round(commentRoom)}px`;
  }
  if (field && document.activeElement === field && field.selectionStart === field.value.length) {
    noteBody.scrollTop = noteBody.scrollHeight;
  }
}

function setView(next) {
  view = next;
  page?.setAttribute("data-view", next);
  try { sessionStorage.setItem("notes-view", next); } catch (error) {}
  for (const button of viewButtons) {
    button.setAttribute("aria-pressed", button.dataset.view === next ? "true" : "false");
  }
}

for (const button of viewButtons) {
  button.addEventListener("click", () => setView(button.dataset.view));
}

document.querySelector(".filter-chips")?.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip-filter");
  if (chip) chip.remove();
});

function closeNoteMenus() {
  for (const menu of document.querySelectorAll(".note-menu")) {
    menu.querySelector(".note-more")?.setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    if (!panel) continue;
    panel.hidden = true;
    panel.classList.remove("is-context");
    panel.style.left = "";
    panel.style.top = "";
  }
}

function openNoteMenu(wrap, point) {
  const more = wrap.querySelector(".note-more");
  const panel = wrap.querySelector(".menu");
  closeNoteMenus();
  if (!panel) return;
  more?.setAttribute("aria-expanded", "true");
  panel.hidden = false;
  if (!point) return;
  panel.classList.add("is-context");
  const box = panel.getBoundingClientRect();
  const left = Math.max(8, Math.min(point.x, window.innerWidth - box.width - 8));
  const top = Math.max(8, Math.min(point.y, window.innerHeight - box.height - 8));
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

function closeCommentMenus() {
  for (const menu of document.querySelectorAll(".comment-menu")) {
    menu.querySelector(".comment-more")?.setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    if (!panel) continue;
    panel.hidden = true;
    panel.classList.remove("is-context");
    panel.style.left = "";
    panel.style.top = "";
  }
}

function openCommentMenu(wrap, point) {
  const more = wrap.querySelector(".comment-more");
  const panel = wrap.querySelector(".menu");
  closeCommentMenus();
  closeNoteMenus();
  closeViewMenus();
  if (!panel) return;
  more?.setAttribute("aria-expanded", "true");
  panel.hidden = false;
  panel.classList.add("is-context");
  const box = panel.getBoundingClientRect();
  const anchor = more.getBoundingClientRect();
  const x = point ? point.x : anchor.right - box.width;
  const y = point ? point.y : anchor.bottom + 4;
  panel.style.left = `${Math.max(8, Math.min(x, window.innerWidth - box.width - 8))}px`;
  panel.style.top = `${Math.max(8, Math.min(y, window.innerHeight - box.height - 8))}px`;
}

document.addEventListener("click", (event) => {
  const viewPick = event.target.closest(".view-pick");
  if (viewPick) {
    const wrap = viewPick.closest(".view-edit");
    const panel = wrap?.querySelector(".menu");
    const open = viewPick.getAttribute("aria-expanded") === "true";
    closeNoteMenus();
    closeDeptMenus();
    closeAuthorMenus();
    closeViewMenus();
    closeCommentMenus();
    if (!open && panel) {
      viewPick.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      if (viewPick.closest(".comment")) placeCommentViewMenu(panel, viewPick);
    }
    return;
  }
  const deptPick = event.target.closest(".dept-pick");
  if (deptPick) {
    const wrap = deptPick.closest(".dept-edit");
    const panel = wrap?.querySelector(".menu");
    const open = deptPick.getAttribute("aria-expanded") === "true";
    closeNoteMenus();
    closeDeptMenus();
    closeAuthorMenus();
    closeViewMenus();
    if (!open && panel) {
      const current = deptPick.dataset.dept;
      for (const item of panel.querySelectorAll("[data-dept-choice]")) {
        item.setAttribute("aria-checked", item.dataset.deptChoice === current ? "true" : "false");
      }
      deptPick.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
    return;
  }
  const choice = event.target.closest("[data-dept-choice]");
  if (choice) {
    const article = choice.closest(".detail");
    const card = rows.find((row) => row.dataset.note === article?.dataset.detail);
    const label = choice.textContent.trim();
    article?.querySelector(".dept-name") && (article.querySelector(".dept-name").textContent = label);
    paintDept(article?.querySelector(".dept-pick"), choice.dataset.deptChoice);
    const meta = article?.querySelector(".brief-meta");
    if (meta) meta.textContent = label;
    if (card) {
      card.dataset.dept = choice.dataset.deptChoice;
      const tag = card.querySelector(".note-line .dept");
      if (tag) tag.textContent = label;
      paintDept(tag, choice.dataset.deptChoice);
    }
    closeDeptMenus();
    closeAuthorMenus();
    applyFilters();
    return;
  }
  const authorPick = event.target.closest(".author-pick");
  if (authorPick) {
    const wrap = authorPick.closest(".author-edit");
    const panel = wrap?.querySelector(".menu");
    const open = authorPick.getAttribute("aria-expanded") === "true";
    closeNoteMenus();
    closeDeptMenus();
    closeAuthorMenus();
    closeViewMenus();
    if (!open && panel) {
      const current = authorPick.dataset.author;
      for (const item of panel.querySelectorAll("[data-author-choice]")) {
        item.setAttribute("aria-checked", item.dataset.authorChoice === current ? "true" : "false");
      }
      authorPick.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
    return;
  }
  const authorChoice = event.target.closest("[data-author-choice]");
  if (authorChoice) {
    const article = authorChoice.closest(".detail");
    const name = authorChoice.dataset.authorChoice;
    paintAuthor(article?.querySelector(".author-pick"), name);
    const card = rows.find((row) => row.dataset.note === article?.dataset.detail);
    const tip = card?.querySelector(".note-author .tip");
    if (tip) tip.textContent = name;
    closeAuthorMenus();
    return;
  }
  if (!event.target.closest(".dept-edit")) closeDeptMenus();
  if (!event.target.closest(".author-edit")) closeAuthorMenus();
  if (!event.target.closest(".view-edit")) closeViewMenus();
  const commentMore = event.target.closest(".comment-more");
  if (commentMore) {
    const wrap = commentMore.closest(".comment-menu");
    const open = commentMore.getAttribute("aria-expanded") === "true";
    closeNoteMenus();
    closeViewMenus();
    if (open) closeCommentMenus();
    else if (wrap) openCommentMenu(wrap);
    return;
  }
  const commentAction = event.target.closest("[data-comment-action]");
  if (commentAction?.dataset.commentAction === "delete") {
    const comment = commentAction.closest(".comment");
    closeCommentMenus();
    if (comment) askDelete(comment);
    return;
  }
  if (!event.target.closest(".comment-menu")) closeCommentMenus();
  const more = event.target.closest(".note-more");
  if (more) {
    closeViewMenus();
    closeCommentMenus();
    const wrap = more.closest(".note-menu");
    const open = more.getAttribute("aria-expanded") === "true";
    if (open) closeNoteMenus();
    else if (wrap) openNoteMenu(wrap);
    return;
  }
  const action = event.target.closest("[data-note-action]");
  if (action) {
    const article = action.closest(".detail");
    closeNoteMenus();
    if (action.dataset.noteAction === "delete" && article) askDelete(article);
    if (action.dataset.noteAction === "copy-link" && article) copyNoteLink(article);
    return;
  }
  if (!event.target.closest(".note-menu")) closeNoteMenus();
});

function copyNoteLink(article) {
  const id = article.dataset.detail || "";
  const url = new URL(location.href);
  url.hash = id;
  const text = url.toString();
  const write = navigator.clipboard?.writeText?.bind(navigator.clipboard);
  if (write) {
    write(text).catch(() => copyWithField(text));
    return;
  }
  copyWithField(text);
}

function copyWithField(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.append(field);
  field.select();
  document.execCommand("copy");
  field.remove();
}

function noteLabel(article) {
  const input = article.querySelector(".note-title");
  if (input) return input.value.trim() || "New note";
  return article.querySelector("h2")?.textContent.trim() || "this note";
}

function removeNote(article) {
  const id = article.dataset.detail;
  const index = rows.findIndex((row) => row.dataset.note === id);
  if (index >= 0) rows.splice(index, 1);
  document.querySelector(`.brief-list [data-note="${CSS.escape(id)}"]`)?.remove();
  article.remove();
  applyFilters();
}

function removeComment(comment) {
  const list = comment.parentElement;
  const form = comment.closest(".brief-replies")?.querySelector(".msg");
  const following = [];
  let seen = false;
  for (const row of list?.querySelectorAll(":scope > .comment") || []) {
    if (row === comment) {
      seen = true;
      continue;
    }
    if (seen) following.push(row);
  }
  const movers = form ? [...following, form] : following;
  const before = new Map(movers.map((row) => [row, row.getBoundingClientRect().top]));
  comment.remove();
  layoutOpenNote();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const row of movers) {
    const delta = before.get(row) - row.getBoundingClientRect().top;
    if (!delta) continue;
    row.style.transition = "none";
    row.style.transform = `translateY(${delta}px)`;
  }
  list?.getBoundingClientRect();
  requestAnimationFrame(() => {
    for (const row of movers) {
      row.style.transition = "transform 180ms ease";
      row.style.transform = "translateY(0)";
    }
  });
  window.setTimeout(() => {
    for (const row of movers) {
      row.style.transition = "";
      row.style.transform = "";
    }
  }, 220);
}

const confirmDialog = document.querySelector(".confirm-dialog");
let pendingDelete = null;

function askDelete(target) {
  pendingDelete = target;
  const title = confirmDialog?.querySelector("#confirm-title");
  const copy = confirmDialog?.querySelector("p");
  const comment = target.classList?.contains("comment");
  if (title) title.textContent = comment ? "Delete this comment?" : "Delete this note?";
  if (copy) {
    const name = comment
      ? (target.querySelector("p")?.textContent.trim() || "this comment")
      : noteLabel(target);
    copy.textContent = `“${name}” will be permanently removed for the whole team.`;
  }
  confirmDialog?.classList.remove("is-closing");
  confirmDialog?.showModal();
}

function closeConfirm() {
  if (!confirmDialog?.open || confirmDialog.classList.contains("is-closing")) return;
  pendingDelete = null;
  const card = confirmDialog.querySelector(".confirm");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !card) {
    confirmDialog.close();
    return;
  }
  confirmDialog.classList.add("is-closing");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    confirmDialog.classList.remove("is-closing");
    confirmDialog.close();
  };
  card.addEventListener("animationend", finish, { once: true });
  window.setTimeout(finish, 240);
}

confirmDialog?.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-confirm]");
  if (choice?.dataset.confirm === "delete" && pendingDelete) {
    if (pendingDelete.classList.contains("comment")) removeComment(pendingDelete);
    else removeNote(pendingDelete);
  }
  if (choice || event.target === confirmDialog) closeConfirm();
});

confirmDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeConfirm();
});

function openNoteMenuFrom(event, card) {
  const article = notePanel(card);
  const wrap = article?.querySelector(".note-menu");
  if (!wrap) return;
  event.preventDefault();
  selectNote(card);
  openNoteMenu(wrap, { x: event.clientX, y: event.clientY });
}

document.querySelector(".brief-list")?.addEventListener("contextmenu", (event) => {
  const card = event.target.closest("[data-note]");
  if (card) openNoteMenuFrom(event, card);
});

document.querySelector(".brief-read")?.addEventListener("contextmenu", (event) => {
  const comment = event.target.closest(".comment");
  if (!comment || event.target.closest(".view-edit")) return;
  event.preventDefault();
  const wrap = comment.querySelector(".comment-menu");
  if (wrap) openCommentMenu(wrap, { x: event.clientX, y: event.clientY });
});

document.addEventListener("input", (event) => {
  if (event.target.classList?.contains("note-draft")) layoutOpenNote();
  const input = event.target.closest(".brief-replies .msg input");
  if (!input) return;
  input.closest(".msg")?.classList.toggle("has-value", input.value.trim().length > 0);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest?.(".brief-replies .msg");
  if (!form || form.classList.contains("is-locked")) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input?.value.trim();
  if (!text) return;
  const row = document.createElement("div");
  row.className = "comment";
  row.innerHTML = `<img class="note-avatar" src="assets/avatar-sarah.png?v=20261029a" alt=""><span class="person-copy"><span class="mini-line">Sarah <span class="meta-k">now</span></span><p></p></span>`;
  row.querySelector("p").textContent = text;
  attachCommentView(row, ["Sarah Mou"]);
  const list = form.parentElement?.querySelector(".comment-scroll-body");
  if (list) list.append(row);
  else form.before(row);
  input.value = "";
  form.classList.remove("has-value");
  layoutOpenNote();
});

try {
  const saved = sessionStorage.getItem("notes-view");
  if (saved === "top") setView(saved);
  else page?.setAttribute("data-view", "top");
} catch (error) {
  page?.setAttribute("data-view", "top");
}

for (const title of rows) title.addEventListener("click", () => selectNote(title));

const lanceInput = document.querySelector(".lance input");
for (const chip of document.querySelectorAll("[data-suggest]")) {
  chip.addEventListener("click", () => {
    if (!lanceInput) return;
    lanceInput.value = chip.textContent.trim();
    lanceInput.dispatchEvent(new Event("input"));
    lanceInput.focus();
  });
}

const collapseButton = document.querySelector(".side-top [data-side-collapse]");
const lanceCollapse = document.querySelector("#lance [data-lance-collapse]");

// Open widths are 277 and 392. Rails are 54 and 62.
// The center keeps the 375px list and a 520px note (895).
// Left nav closes first, then the chat. See patterns.md, Window resize.
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
    document.body.classList.remove("is-side-settling");
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

function edgeFade(el, axis) {
  const update = () => {
    const max = axis === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const pos = axis === "x" ? el.scrollLeft : el.scrollTop;
    const fade = el.closest(".scroll-fade") || el.closest(".side-scroll-frame") || el;
    fade.classList.toggle("is-fade-start", max > 1 && pos > 1);
    fade.classList.toggle("is-fade-end", max > 1 && pos < max - 1);
  };
  update();
  el.addEventListener("scroll", update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(el);
  for (const child of el.children) observer.observe(child);
}

const sideScroll = document.querySelector(".side-scroll");
if (sideScroll) edgeFade(sideScroll, "y");
const deptStrip = document.querySelector(".page-filters .tabs");
if (deptStrip) {
  edgeFade(deptStrip, "x");
  const fade = deptStrip.parentElement;
  const thumb = document.createElement("div");
  thumb.className = "tabs-bar-thumb";
  thumb.setAttribute("aria-hidden", "true");
  thumb.hidden = true;
  fade.appendChild(thumb);
  const placeThumb = () => {
    const max = deptStrip.scrollWidth - deptStrip.clientWidth;
    if (max <= 1) {
      thumb.hidden = true;
      return;
    }
    thumb.hidden = false;
    const inset = 2;
    const track = deptStrip.clientWidth - inset * 2;
    const size = Math.max(32, track * (deptStrip.clientWidth / deptStrip.scrollWidth));
    const x = inset + (deptStrip.scrollLeft / max) * (track - size);
    thumb.style.width = `${size}px`;
    thumb.style.transform = `translateX(${x}px)`;
  };
  placeThumb();
  fade.addEventListener("wheel", (event) => {
    const max = deptStrip.scrollWidth - deptStrip.clientWidth;
    if (max <= 1) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    const next = Math.max(0, Math.min(max, deptStrip.scrollLeft + delta));
    if (next === deptStrip.scrollLeft) return;
    event.preventDefault();
    deptStrip.scrollLeft = next;
  }, { passive: false });
  deptStrip.addEventListener("scroll", placeThumb, { passive: true });
  const thumbObserver = new ResizeObserver(placeThumb);
  thumbObserver.observe(deptStrip);
  for (const child of deptStrip.children) thumbObserver.observe(child);
  let drag = null;
  thumb.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, left: deptStrip.scrollLeft };
    thumb.setPointerCapture(event.pointerId);
    thumb.style.cursor = "grabbing";
  });
  thumb.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const max = deptStrip.scrollWidth - deptStrip.clientWidth;
    const room = Math.max(1, deptStrip.clientWidth - thumb.getBoundingClientRect().width);
    deptStrip.scrollLeft = drag.left + ((event.clientX - drag.x) / room) * max;
  });
  const endDrag = () => {
    drag = null;
    thumb.style.cursor = "";
  };
  thumb.addEventListener("pointerup", endDrag);
  thumb.addEventListener("pointercancel", endDrag);
}
const noteList = document.querySelector(".brief-list");
if (noteList) edgeFade(noteList, "y");

function closeDeptMenus() {
  for (const menu of document.querySelectorAll(".dept-edit")) {
    menu.querySelector(".dept-pick")?.setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    if (panel) panel.hidden = true;
  }
}

function closeAuthorMenus() {
  for (const menu of document.querySelectorAll(".author-edit")) {
    menu.querySelector(".author-pick")?.setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    if (panel) panel.hidden = true;
  }
}

function closeViewMenus() {
  for (const menu of document.querySelectorAll(".view-edit")) {
    menu.querySelector(".view-pick")?.setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    if (!panel) continue;
    panel.hidden = true;
    panel.classList.remove("is-context");
    panel.style.left = "";
    panel.style.top = "";
  }
}

function placeCommentViewMenu(panel, button) {
  panel.classList.add("is-context");
  panel.hidden = false;
  const anchor = button.getBoundingClientRect();
  const menu = panel.getBoundingClientRect();
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - menu.width - 8));
  const top = Math.max(8, Math.min(anchor.bottom + 4, window.innerHeight - menu.height - 8));
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

const readers = [
  { name: "Sarah Mou", seen: ["gss", "enroll"] },
  { name: "Jordan Hale", seen: ["gss", "enroll"] },
  { name: "Priya Shah", seen: [] },
  { name: "Luis Ortega", seen: [] },
  { name: "Mina Park", seen: [] },
  { name: "Owen Brooks", seen: [] },
  { name: "Elena Voss", seen: [] },
  { name: "Chris Adeyemi", seen: [] },
];

function viewRow(name) {
  const safe = name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<div class="view-row"><img class="avatar mini" src="assets/avatar-sarah.png?v=20261029a" alt="">${safe}</div>`;
}

function writeViewMenu(panel, seen, missed) {
  const seenRows = seen.length ? `<p class="menu-k">Viewed</p>${seen.map((person) => viewRow(person.name)).join("")}` : "";
  panel.innerHTML = `${seenRows}<p class="menu-k">Not viewed</p>${missed.map((person) => viewRow(person.name)).join("")}`;
}

function fillViewMenu(article) {
  const panel = article.querySelector(".note-meta .view-menu");
  const count = article.querySelector(".note-meta .view-count");
  if (!panel || !count) return;
  const id = article.dataset.detail;
  const seen = readers.filter((person) => person.seen.includes(id));
  const missed = readers.filter((person) => !person.seen.includes(id));
  writeViewMenu(panel, seen, missed);
  count.textContent = `${seen.length}/${readers.length}`;
  mountCommentViews(article);
}

function commentViewChip() {
  return `<span class="drop view-edit comment-views"><button class="chip view-pick" type="button" aria-expanded="false" aria-haspopup="menu" aria-label="Views"><svg class="i view-eye" width="18" height="18" aria-hidden="true"><use href="#i-eye"/></svg><span class="view-count"></span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></button><div class="menu view-menu" role="menu" hidden></div></span>`;
}

function commentMenu() {
  return `<div class="drop comment-menu"><button class="comment-more" type="button" aria-expanded="false" aria-haspopup="menu" aria-label="More"><svg class="i" width="14" height="14"><use href="#i-dots"/></svg></button><div class="menu" role="menu" hidden><button class="menu-item danger" type="button" role="menuitem" data-comment-action="delete"><svg class="i" width="14" height="14"><use href="#i-trash"/></svg>Delete</button></div></div>`;
}

function mountCommentMenu(comment) {
  const menu = comment.querySelector(".comment-menu");
  if (menu) {
    comment.append(menu);
    return;
  }
  comment.insertAdjacentHTML("beforeend", commentMenu());
}

function attachCommentView(comment, seenNames) {
  if (!comment.querySelector(".comment-views")) {
    comment.insertAdjacentHTML("beforeend", commentViewChip());
    const seen = readers.filter((person) => seenNames.includes(person.name));
    const missed = readers.filter((person) => !seenNames.includes(person.name));
    const panel = comment.querySelector(".view-menu");
    const count = comment.querySelector(".view-count");
    if (panel) writeViewMenu(panel, seen, missed);
    if (count) count.textContent = `${seen.length}/${readers.length}`;
  }
  mountCommentMenu(comment);
}

function mountCommentViews(article) {
  const names = readers.filter((person) => person.seen.includes(article.dataset.detail)).map((person) => person.name);
  for (const comment of article.querySelectorAll(".comment")) attachCommentView(comment, names);
}

for (const article of document.querySelectorAll(".detail")) fillViewMenu(article);

function departments() {
  return deptTabs
    .filter((tab) => tab.dataset.dept && tab.dataset.dept !== "All")
    .map((tab) => ({
      value: tab.dataset.dept,
      label: tab.dataset.dept === "Front Desk" ? "Front desk" : tab.dataset.dept,
    }));
}

function addSizer(host, text) {
  if (!host || host.querySelector(":scope > [aria-hidden='true']")) return;
  const sizer = document.createElement("span");
  sizer.setAttribute("aria-hidden", "true");
  sizer.textContent = text;
  host.classList.add("meta-fit");
  host.append(sizer);
}

function fitPlain(dd, longest) {
  if (!dd || dd.dataset.fit === "1") return;
  const visible = document.createElement("span");
  visible.textContent = dd.textContent.trim();
  dd.textContent = "";
  dd.append(visible);
  addSizer(dd, longest);
  dd.dataset.fit = "1";
}

function fitMeta(article) {
  const cells = article.querySelectorAll(".note-meta > div");
  fitPlain(cells[0]?.querySelector("dd"), "Yesterday · 12:59 PM");
  const count = cells[3]?.querySelector(".view-count");
  if (count && !count.parentElement.classList.contains("meta-fit")) {
    const wrap = document.createElement("span");
    count.before(wrap);
    wrap.append(count);
    addSizer(wrap, `${readers.length}/${readers.length}`);
  }
}

function deptValueFromLabel(label) {
  const match = departments().find((dept) => dept.label === label || dept.value === label);
  return match ? match.value : label;
}

function paintDept(node, value) {
  if (node && value) node.dataset.dept = value;
}

function departmentChoices(selected) {
  return departments().map((dept) => {
    const value = dept.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const label = dept.label.replace(/&/g, "&amp;");
    const checked = dept.value === selected ? "true" : "false";
    return `<button class="menu-item" type="button" role="menuitemradio" data-dept-choice="${value}" aria-checked="${checked}"><span class="dept" data-dept="${value}">${label}</span><svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`;
  }).join("");
}

function upgradeDept(article) {
  const chip = article.querySelector(".note-meta .dept");
  if (!chip || chip.classList.contains("dept-pick")) return;
  const raw = chip.textContent.trim();
  const label = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const value = deptValueFromLabel(raw).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  chip.parentElement.innerHTML = `<div class="drop dept-edit"><button class="dept dept-pick" type="button" data-dept="${value}" aria-expanded="false" aria-haspopup="menu"><span class="dept-name">${label}</span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></button><div class="menu" role="menu" hidden>${departmentChoices(deptValueFromLabel(raw))}</div></div>`;
}

function authorFace(name) {
  if (name === "Sarah Mou") return `<img class="avatar mini" src="assets/avatar-sarah.png?v=20261029a" alt="">`;
  const initials = name.split(" ").map((part) => part[0] || "").join("").slice(0, 2);
  return `<span class="avatar mini">${esc(initials)}</span>`;
}

function authorChoices(selected) {
  return readers.map((person) => {
    const checked = person.name === selected ? "true" : "false";
    return `<button class="menu-item" type="button" role="menuitemradio" data-author-choice="${esc(person.name)}" aria-checked="${checked}"><span class="mini-pill">${authorFace(person.name)}${esc(person.name)}</span><svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`;
  }).join("");
}

function paintAuthor(button, name) {
  if (!button) return;
  button.dataset.author = name;
  button.setAttribute("aria-label", `Author, ${name}`);
  button.innerHTML = `${authorFace(name)}<span class="author-name">${esc(name)}</span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg>`;
}

function upgradeAuthor(article) {
  const dd = article.querySelectorAll(".note-meta > div")[2]?.querySelector("dd");
  if (!dd || dd.querySelector(".author-pick")) return;
  const name = dd.textContent.trim() || "Sarah Mou";
  const longest = readers.reduce((best, person) => person.name.length > best.name.length ? person : best);
  dd.innerHTML = `<div class="drop author-edit"><span class="author-slot"><button class="mini-pill author-pick" type="button" data-author="${esc(name)}" aria-expanded="false" aria-haspopup="menu" aria-label="Author, ${esc(name)}">${authorFace(name)}<span class="author-name">${esc(name)}</span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></button><span class="mini-pill author-sizer" aria-hidden="true">${authorFace(longest.name)}${esc(longest.name)}<svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></span></span><div class="menu" role="menu" hidden>${authorChoices(name)}</div></div>`;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function reserveDept(article) {
  const edit = article.querySelector(".dept-edit");
  const button = edit?.querySelector(".dept-pick");
  if (!edit || !button || edit.querySelector(".dept-slot")) return;
  const longest = departments().reduce((best, dept) => dept.label.length > best.length ? dept.label : best, "");
  const slot = document.createElement("span");
  slot.className = "dept-slot";
  button.before(slot);
  slot.append(button);
  const sizer = document.createElement("span");
  sizer.className = "dept dept-sizer";
  sizer.setAttribute("aria-hidden", "true");
  sizer.innerHTML = `${longest.replace(/&/g, "&amp;").replace(/</g, "&lt;")}<svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg>`;
  slot.append(sizer);
}

for (const article of document.querySelectorAll(".detail")) {
  upgradeDept(article);
  upgradeAuthor(article);
  reserveDept(article);
  fitMeta(article);
}

function noteHasText(article) {
  const title = article.querySelector(".note-title");
  const draft = article.querySelector(".note-draft");
  const titleText = title ? title.value.trim() : (article.querySelector("h2")?.textContent || "").trim();
  const bodyText = draft ? draft.value.trim() : (article.querySelector(".brief-body")?.textContent || "").trim();
  return titleText.length > 0 || bodyText.length > 0;
}

function syncCommentLock(article) {
  const form = article?.querySelector(".brief-replies .msg");
  if (!form) return;
  const locked = !noteHasText(article);
  form.classList.toggle("is-locked", locked);
  for (const control of form.querySelectorAll("input, button")) control.disabled = locked;
  if (!locked) return;
  const input = form.querySelector("input");
  if (input) input.value = "";
  form.classList.remove("has-value");
}

function noteStamp() {
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `Today · ${time}`;
}

function revealNewCard(list, card) {
  const visible = [...list.querySelectorAll(":scope > button:not([hidden])")];
  const before = new Map(visible.map((row) => [row, row.getBoundingClientRect().top]));
  list.prepend(card);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const movers = [card, ...visible];
  for (const row of movers) {
    const delta = row === card ? -row.getBoundingClientRect().height : before.get(row) - row.getBoundingClientRect().top;
    row.style.transition = "none";
    row.style.transform = `translateY(${delta}px)`;
  }
  list.getBoundingClientRect();
  requestAnimationFrame(() => {
    for (const row of movers) {
      row.style.transition = "transform 180ms ease";
      row.style.transform = "translateY(0)";
    }
  });
  window.setTimeout(() => {
    for (const row of movers) {
      row.style.transition = "";
      row.style.transform = "";
    }
  }, 220);
}

const currentPerson = { name: "Sarah Mou", dept: "Front Desk", deptLabel: "Front desk" };

function createNote() {
  const list = document.querySelector(".brief-list");
  const read = document.querySelector(".brief-read");
  if (!list || !read) return;
  const id = "new-" + Date.now();
  const stamp = noteStamp();
  const deptChoices = departmentChoices(currentPerson.dept);
  const card = document.createElement("button");
  card.type = "button";
  card.setAttribute("role", "option");
  card.dataset.note = id;
  card.dataset.dept = currentPerson.dept;
  card.classList.add("is-untitled");
  card.innerHTML = `<span class="note-avatar-slot tip-host note-author"><img src="assets/avatar-sarah.png?v=20261029a" alt=""><span class="tip">${currentPerson.name}</span></span><span class="note-copy"><span class="note-line"><span class="note-time">${stamp}</span><span class="dept" data-dept="${currentPerson.dept}">${currentPerson.deptLabel}</span></span><span class="brief-title">New note</span><span class="brief-preview">Write a note...</span></span>`;
  revealNewCard(list, card);
  const article = document.createElement("article");
  article.className = "detail";
  article.dataset.detail = id;
  article.hidden = true;
  article.innerHTML = `<div class="brief-top"><textarea class="note-title" aria-label="Title" placeholder="New note" rows="1"></textarea><div class="drop note-menu"><button class="note-more" type="button" aria-expanded="false" aria-haspopup="menu" aria-label="More"><svg class="i" width="14" height="14"><use href="#i-dots"/></svg></button><div class="menu" role="menu" hidden><button class="menu-item" type="button" role="menuitem" data-note-action="share"><svg class="i" width="14" height="14"><use href="#i-share"/></svg>Share</button><button class="menu-item" type="button" role="menuitem" data-note-action="copy-link"><svg class="i" width="14" height="14"><use href="#i-link"/></svg>Copy link</button><button class="menu-item danger" type="button" role="menuitem" data-note-action="delete"><svg class="i" width="14" height="14"><use href="#i-trash"/></svg>Delete</button></div></div></div><dl class="note-meta"><div><dt>Timestamp</dt><dd>${stamp}</dd></div><div><dt>Department</dt><dd><div class="drop dept-edit"><button class="dept dept-pick" type="button" data-dept="${currentPerson.dept}" aria-expanded="false" aria-haspopup="menu"><span class="dept-name">${currentPerson.deptLabel}</span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></button><div class="menu" role="menu" hidden>${deptChoices}</div></div></dd></div><div><dt>Author</dt><dd>${currentPerson.name}</dd></div><div><dt>Viewed</dt><dd><div class="drop view-edit"><button class="chip view-pick" type="button" aria-expanded="false" aria-haspopup="menu"><svg class="i view-eye" width="18" height="18" aria-hidden="true"><use href="#i-eye"/></svg><span class="view-count">0/8</span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></button><div class="menu view-menu" role="menu" hidden></div></div></dd></div></dl><div class="brief-main"><p class="brief-meta">${currentPerson.deptLabel}</p><textarea class="note-draft" aria-label="Note" placeholder="Write a note..."></textarea><section class="brief-replies" aria-label="Comments"><h3>Comments</h3><form class="msg" data-composer><span class="lead"><button class="well" type="button" aria-label="Add"><svg class="i" width="16" height="16"><use href="#i-plus"/></svg></button><input aria-label="Write a comment" placeholder="Write a comment..."></span><button class="well" type="submit" aria-label="Send"><svg class="i" width="16" height="16"><use href="#i-up"/></svg></button></form></section></div>`;
  read.append(article);
  const titleInput = article.querySelector(".note-title");
  const draft = article.querySelector(".note-draft");
  const fitTitle = () => {
    titleInput.style.height = "auto";
    titleInput.style.height = `${titleInput.scrollHeight}px`;
  };
  const syncDraft = () => {
    const title = titleInput.value.trim();
    card.classList.toggle("is-untitled", title.length === 0);
    card.classList.toggle("is-ready", title.length > 0 || draft.value.trim().length > 0);
    card.querySelector(".brief-title").textContent = title || "New note";
    const line = draft.value.trim().split("\n").find(Boolean);
    card.querySelector(".brief-preview").textContent = line || "Write a note...";
    fitTitle();
    syncCommentLock(article);
    layoutOpenNote();
  };
  titleInput.addEventListener("input", syncDraft);
  draft.addEventListener("focus", () => {
    draft.placeholder = "";
  });
  draft.addEventListener("blur", () => {
    if (!draft.value.trim()) draft.placeholder = "Write a note...";
  });
  draft.addEventListener("input", syncDraft);
  rows.unshift(card);
  card.addEventListener("click", () => selectNote(card));
  if (selectedDept() !== "All" && selectedDept() !== currentPerson.dept) {
    for (const tab of deptTabs) tab.setAttribute("aria-selected", tab.dataset.dept === "All" ? "true" : "false");
  }
  selectNote(card);
  applyFilters();
  fillViewMenu(article);
  reserveDept(article);
  upgradeAuthor(article);
  fitMeta(article);
  const focusTitle = () => titleInput.focus();
  if (confirmDialog?.open) confirmDialog.addEventListener("close", focusTitle, { once: true });
  else focusTitle();
}

for (const button of document.querySelectorAll("[data-new]")) button.addEventListener("click", createNote);

if (rows.length === 0) createNote();
for (const article of document.querySelectorAll(".detail")) syncCommentLock(article);

for (const host of document.querySelectorAll(".tip-host")) {
  host.addEventListener("click", () => host.classList.add("is-settled"));
  host.addEventListener("pointerleave", () => host.classList.remove("is-quiet", "is-settled"));
  host.addEventListener("blur", () => {
    if (!host.matches(":hover")) host.classList.remove("is-quiet", "is-settled");
  });
}

for (const host of document.querySelectorAll(".side .tip-host")) {
  const tip = host.querySelector(".tip");
  if (!tip) continue;
  let placeFrame = 0;
  const place = () => {
    placeFrame = 0;
    if (host.classList.contains("is-quiet")) return;
    const rect = host.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
    tip.style.left = `${rect.right + gap}px`;
    tip.style.top = `${rect.top + rect.height / 2}px`;
  };
  let followUntil = 0;
  const follow = (until) => {
    const tick = (now) => {
      if (followUntil !== until) return;
      place();
      if (now < until) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const placeNext = () => {
    if (host.classList.contains("is-quiet")) return;
    cancelAnimationFrame(placeFrame);
    placeFrame = requestAnimationFrame(place);
  };
  host.addEventListener("mouseenter", () => {
    followUntil = performance.now() + 200;
    follow(followUntil);
  });
  host.addEventListener("focus", placeNext);
  host.addEventListener("pointerdown", () => {
    followUntil = 0;
    cancelAnimationFrame(placeFrame);
  });
}

const noteColumn = document.querySelector(".brief-read");
if (noteColumn && "ResizeObserver" in window) {
  new ResizeObserver(() => layoutOpenNote()).observe(noteColumn);
}
