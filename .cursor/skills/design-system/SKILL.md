---
name: design-system
description: "Apply this repo's design system for any UI work: tokens, color, type, spacing, radius, components, screens, notes, todos, icons, motion, dark mode, and polish. Use it whenever the user designs, restyles, adds a screen, implements or matches a component, edits HTML or CSS, or asks to fix spacing, alignment, hover, or a selected control — including a small follow-up like \"fix this.\""
---

# Design system

The gallery (`index.html`, `css/gallery.css`) is the component catalog. `css/tokens.css` is the only source of color, type, space, radius, and shadow. Product pages compose those pieces. A new screen should look like it was already in the gallery: the same person, the same urgency, the same button, the same header.

## Workflow

1. Read the one reference that matches the task. Read a second only when the task crosses it.
2. Copy the closest gallery component and style it with tokens. When a shared rule and a component both set padding, the component wins. Check the rendered box.
3. Change only what the task needs. A follow-up on a selected control stays on that control.
4. Before finishing, walk [references/quality-checklist.md](references/quality-checklist.md) for the rows this change could break.

## Which file

| Task | Read |
| --- | --- |
| Tokens: color, type, space, radius, shadow, dark mode, scrollbar | [references/foundations.md](references/foundations.md) |
| A named component, the sidebar, delete confirmation, the switch | [references/components.md](references/components.md) |
| A screen, the header, panels, creating, completing, or removing a record, a person or an urgency | [references/patterns.md](references/patterns.md) |
| Motion, wrapping, hit area, overflow, icons, containers | [references/polish.md](references/polish.md) |
| A follow-up fix, a selected node, spacing, a hairline, collapse, or an input state | [references/guard-rails.md](references/guard-rails.md) |
| Before calling UI work done | [references/quality-checklist.md](references/quality-checklist.md) |

Notes UI is `notes.html`, `css/notes.css`, and `js/notes.js`. The measurements in each reference are the spec. Do not invent a second version of them here.

## Always

These hold on every screen. The file named on each line has the measurements.

- Use a token, not a new hex, font size, or spacing step. A second value sits beside a system that is already measured. See [references/foundations.md](references/foundations.md).
- Hover and selected share one step darker than the surface they sit on: `--white`, then `--sidebar-grey`, then `--grey`, then `--black-12`, then `--black-25`. A second step on an already-selected control makes the selection jump under the pointer. A resting fill uses that same step. Dark mode lightens those steps, and the page stays the darkest surface, so chrome that was darker than the page in light mode is lighter than the page in dark mode. See [references/foundations.md](references/foundations.md).
- A button press scales the whole control to `0.97`, label and icon included, and eases back over 160ms on `--ease-out`. The hover fill stays. Reduced motion skips the scale. Every `button` does this, including icon buttons, menu items, chips, and tabs. See [references/polish.md](references/polish.md).
- A person's name is the gallery person treatment, an urgency is the gallery urgency chip, and a type is the department chip for that type, wherever that fact appears. A second drawing in a menu, filter, or table reads as a different kind of thing. See [references/patterns.md](references/patterns.md).
- A table is the gallery table, filter row included. Copy that section for a new table. A column that shows one of a fixed set of options is already as wide as its longest option, including that option’s icon and padding. The control still hugs the value it is showing. Choosing another option does not move that column or the columns beside it. See [references/components.md](references/components.md) and [references/patterns.md](references/patterns.md).
- The sidebar, the standard header, and the fixed side panels are each one component. Restyling them on a single page makes the product feel like separate apps. See [references/components.md](references/components.md) and [references/patterns.md](references/patterns.md).
- Motion explains the change. Something that leaves a list closes the gap. Something completed stays long enough to read, then leaves. A keyboard action snaps, because those actions repeat all day and a fade makes them feel late. New motion uses the strong curves in [references/polish.md](references/polish.md): `--ease-out`, `--ease-in-out`, and `--ease-drawer`. A drag or a gesture uses a spring. A modal or a drawer may run 200–500ms. Elements that enter together stagger by 30–80ms. An entrance starts at `scale(0.95)`, not `scale(0)`. A popover grows from its trigger. A crossfade that still looks wrong takes a blur under 20px. See [references/polish.md](references/polish.md) and [references/patterns.md](references/patterns.md).
- A tooltip is always in front. It paints above the page, the table, and the sidebar. See [references/guard-rails.md](references/guard-rails.md).
- Spacing, hairlines, collapse, tooltips, icons, and input states already have a settled answer. A follow-up should match that answer. See [references/guard-rails.md](references/guard-rails.md).
