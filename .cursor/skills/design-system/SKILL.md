---
name: design-system
description: "Match this product's existing interface for any UI work in this repo. Use it whenever the user builds, restyles, reviews, or fixes a screen, component, or style — notes, todos, the gallery, a new page, HTML, CSS, spacing, alignment, hover, motion, dark mode, icons, or a selected control — including a small follow-up like \"fix this,\" even when they do not name the design system."
---

# Design system

The gallery (`catalog/index.html`, `catalog/gallery.css`) is the component catalog. `catalog/tokens.css` is the only source of color, type, space, radius, and shadow. `catalog/todos-alt.css` styles the table and filter row in that gallery. `catalog/notes.html` is the header and sidebar specimen. The avatar in those pages is `catalog/assets/avatar-sarah.png`.

These files sit in this skill folder, next to `SKILL.md`. Read them from here in whatever project you are editing. Do not look for `css/tokens.css`, `css/gallery.css`, `index.html`, or `notes.html` at the project root when they are not there.

When the project you are editing already contains those live files, the live files are the source. Read and edit the live files. `catalog/` is the copy that travels with this skill. When the live files are absent, read `catalog/` and apply those values in the styling system the project already uses.

A new screen uses the same person, the same urgency, the same button, and the same header. A control that is not named yet still uses this system: copy the closest gallery component and apply the invariants below. Do not invent a second version of a measurement that already lives in a reference.

## Workflow

1. Read the one reference that matches the task. If the task is not named in the table, read foundations and the closest row. Read a second file only when the task crosses it. A follow-up reads guard rails for scope, then the file for the thing being fixed.
2. For a new screen, read The job and Spacing a screen in [references/patterns.md](references/patterns.md). The screen is that sentence plus the blocks named there: header, filter row, note card, comment thread, task row, and detail panel. Existing pages show how the pieces look, not the only layouts. Spacing a screen is the quality bar, not a layout to copy. Then style with roles and aliases from `catalog/tokens.css`. When a shared rule and a component both set padding, the component wins. Check the rendered box.
3. Change only what the task needs. A follow-up on a selected control stays on that control.
4. Before finishing, walk [references/quality-checklist.md](references/quality-checklist.md) for the rows this change could break.

## Which file

| Task | Read |
| --- | --- |
| Tokens, color, type, space, radius, shadow, dark mode, scrollbar, buttons, hover, what stays, or layering | [references/foundations.md](references/foundations.md) |
| A named component, the sidebar, a table, delete confirmation, the switch | [references/components.md](references/components.md) |
| A screen, the job sentence, spacing a screen, a block (header, filter row, note card, comment thread, task row, detail panel), a lesson card, creating, completing, or removing a record, a person, an urgency, or a type | [references/patterns.md](references/patterns.md) |
| Motion, wrapping, hit area, overflow, icons, containers | [references/polish.md](references/polish.md) |
| A follow-up, a selected node, spacing, a hairline, collapse, or an input state | [references/guard-rails.md](references/guard-rails.md) |
| Before calling UI work done | [references/quality-checklist.md](references/quality-checklist.md) |

The notes specimen is `catalog/notes.html`. Screen-only note layout is not in this catalog. The measurements in each reference are the spec.

## Invariants

These hold on every screen, including one that does not exist yet. The linked file has the measurements.

- Use a token. A second hex, font size, or spacing step sits beside a system that is already measured. See [references/foundations.md](references/foundations.md).
- Hover and selected share one step from the surface they sit on. A second step on an already-selected control makes the selection jump. A button changes its fill only. A fact, a photo, and the neighbors stay, except where [references/foundations.md](references/foundations.md) names an exception.
- A press scales the whole control, label and icon included, to `0.98`. It does not darken the fill. See [references/polish.md](references/polish.md).
- A tooltip is the top layer. Menus, the filter row, and the detail panel use the stack in [references/foundations.md](references/foundations.md).
- A fact has one drawing. A person, an urgency, and a type keep the gallery treatment wherever they appear, including a menu, a filter, or a table. Picking a person is a dropdown of people who already exist. A new person is added in Settings. Picking a room is a dropdown of rooms that already exist. See [references/patterns.md](references/patterns.md).
- Shared chrome is one component. The sidebar, the header, a table, and a side panel are not restyled per page. See [references/components.md](references/components.md).
- Motion explains the change. A frequent control snaps. Something that leaves closes the gap. See [references/polish.md](references/polish.md).
- A follow-up matches the settled answer for spacing, hairlines, collapse, tooltips, icons, and inputs. See [references/guard-rails.md](references/guard-rails.md).
- Match the quality in Spacing a screen, not its layout. Group what belongs together. Keep the gap inside a group smaller than the gap between groups. Leave off a label the content does not need. One primary action, placed where the person is already looking. The lesson card’s measurements belong to the lesson card. See [references/patterns.md](references/patterns.md).
- A dropdown hugs its longest label, then leaves 16px to the edge. Short labels stay at `--menu-min`. Past `--menu-max` the label truncates. Every option label is `--text-14`, the same size as the category row. See [references/components.md](references/components.md).

## Examples

**Fix one control.** The user selects a chip and says "fix this." Read guard rails, then the file for that chip. Change the chip. Leave the row, the fields beside it, and the header alone.

**A screen with no section yet.** The user asks for a new page. Read The job in patterns. Decide the arrangement from the job. Notes and to-dos show how a person, a department, and an urgency look. They are not the only layouts.

## Review

When reviewing UI, use one markdown table. One row per issue. Name the current value, the value this system uses, and the reason.

| Before | After | Why |
| --- | --- | --- |
| `scale(0.9)` on press | `scale(0.98)` | A press stays in the range in polish. This gallery uses `0.98` |
