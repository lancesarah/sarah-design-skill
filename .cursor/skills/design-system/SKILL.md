---
name: design-system
description: "Design-engineering rules and the decision process behind this product's tactile, layered, quiet interface. Use when building, restyling, reviewing, or fixing a screen, component, or style — notes, todos, the gallery, a new page, HTML, CSS, spacing, alignment, hover, motion, dark mode, icons, or a selected control — including a small follow-up like \"fix this,\" even when they do not name the design system. Also when deciding the one next action, how much to show, where a control sits, or how hierarchy should read."
---

# Design system

Interfaces built with this skill feel physical but quiet. A page that is itself the surface. Controls that take one step from whatever they sit on, and squeeze slightly when pressed. One blue action that says what to do next. Facts — a person, a department, an urgency, a photo — that stay put while the control under the pointer changes. Hierarchy comes from a size step and an ink step, not from a new color or a stack of boxes.

Everything is written as **roles and ratios** ("one step from its ground", "the blue action", "the gap inside a group smaller than the gap between groups"). The concrete numbers are this product's, in `catalog/tokens.css`. Do not remap them to another palette. A second hex, font size, or spacing step sits beside a system that is already measured.

The gallery (`catalog/index.html`, `catalog/gallery.css`) is the component catalog. `catalog/tokens.css` is the only source of color, type, space, radius, and shadow. `catalog/todos-alt.css` styles the table and filter row. `catalog/notes.html` is the header and sidebar specimen. The avatar in those pages is `catalog/assets/avatar-sarah.png`.

These files sit in this skill folder, next to `SKILL.md`. Read them from here in whatever project you are editing. Do not look for `css/tokens.css`, `css/gallery.css`, `index.html`, or `notes.html` at the project root when they are not there.

When the project you are editing already contains those live files, the live files are the source. Read and edit the live files. `catalog/` is the copy that travels with this skill. When the live files are absent, read `catalog/` and apply those values in the styling system the project already uses.

**Vocabulary**

- **Ground** (the parent): the surface a thing sits on. Its fill and its hover come from that ground, one step along the ladder. **Raised**: a control or overlay that sits on the ground (a button, a menu, a lesson card). **Well**: a field sunk into the ground (the comment composer on `--bg-surface` is `--sidebar-grey`). **Overlay**: a menu, tooltip, toast, confirm, or detail panel that floats over the page.
- **Ink ladder**, light: `--white` → `--sidebar-grey` → `--grey` → `--black-12` → `--black-25`. Hover and selected take the next step. They share it. A second step on an already-selected control makes the selection jump.
- **Ink ladder**, dark: the page is lighter than the chrome. Steps are `--white` → `--grey` → `--black-12` → `--grey-up`. Hover lightens. `--sidebar-grey` is chrome, darker than the page, and is off this ladder.
- **Ink roles**: `--black` is strong text. `--text-muted` (the same value as `--black-50`) is secondary text, placeholders, and meta. `--black-25` is the quieter grey: unselected counts, the light search ring, scrollbars.
- **Action**: `--action` / `--action-hover`, the one blue. **Destructive**: `--destructive`, the one red, on a danger button. Fill or light. Never the primary.
- **Identity hues**: a department (`--dept-`*) or an urgency (`--urgency-*`) names a fact. They do not rank importance and they do not restyle on hover.

## Operating posture

- **Smallest change that fixes it.** A follow-up on a selected control stays on that control. Leave the row, the fields beside it, and the header alone.
- **Reuse before inventing.** Read that component's section in [components.md](references/components.md) before using it. Its When and When not lines pick the component. Copy the closest gallery component and its class. A control that is not named yet still uses this system. A new component needs a reason, and then a labeled section in the gallery.
- **Do not restyle.** A component that already exists is used as it is. Copy its class. Do not change its size, fill, padding, radius, icon, or label to match a screenshot or to fit a new screen. If a corresponding component is already in the gallery, there is no second version of it. See [guard-rails.md](references/guard-rails.md).
- **Remove before adding.** Borders, containers, separators, icons, and labels the content does not need. A screen with one action does not get a card. A long record does not put every section in a matching fill.
- **Match the neighbour.** Siblings share height, padding, radius, text size, and ink. An unmatched sibling is a bug. A header label sits on its own column.
- **Borrow from the parent.** A control's fill is never absolute. On white it is `--sidebar-grey`. On `--sidebar-grey` it is `--grey`. In dark mode a control on the page is `--grey`, and on a hovered row it is `--black-12`. It should feel equally pressable on a page, a row, a panel, or a sheet.
- **A rule is global.** Once a rule is decided, apply it to every instance in the same change. A person, an urgency, and a type keep one drawing in a menu, a filter, a table, and a panel.
- **A component rule stays on the component.** The size, the fill, and the exception that belong to one component are written in that component's section. They are not copied into these tables, the checklist, or the guard rails.
- **Light first, dark on purpose.** `html[data-theme="dark"]` recolors the same tokens. Type, sizes, spacing, and radii never fork. A light-mode restyle does not touch dark unless dark is named.
- **Show only what this state needs.** Empty is the empty this product already has. If that section has no empty yet, say it is undecided. Do not invent a banner, a red row, or a second empty for an error. Error is not built yet.
- **Check the rendered box.** Equal padding is not alignment. Look at the pixels. Group what belongs together. The gap inside a group stays smaller than the gap between groups.
- **Plain words.** In the UI and in your replies. Truncation is the `…` character.

## The decision order

Work top to bottom. Each step constrains the next. Most weak UI comes from starting at the component.

1. **Hierarchy – Determine the user’s first required action.**  

   State the task in one sentence: identify who is present, what they are trying to complete, and what they must see to finish it. That sentence defines the single next step on the screen, either the primary action or none at all.  

   Rank all other actions beneath it:  

   - Secondary – white, raised button  

   - Utility – round pill or icon  

   - Tertiary – the grey fill. See Tertiary button in [components.md](references/components.md)  

   Destructive actions are never primary. If a page only displays content, the action corner remains empty; the page’s purpose does not need a prompt.  

   Hierarchy is the first decision. A screen with two primaries, or with a primary that isn’t the true next step, is incorrect before any color or layout is chosen.
2. **Amount of data: the least that answers the question.** What they scan is the main surface. What they need at the moment they act sits with that action. What they need rarely can wait. Do not repeat what a heading already says. Do not show a label the content does not need.
3. **Placement.** A main page puts its one primary, with an icon, on the right of the header. Every button in the header has an icon. A text-only header button is wrong. A full subpage keeps its content within 820px. Its top-right is back navigation only. A primary on a subpage sits in the page content. A section's actions sit with that section. A control sits next to what it sets. Search is not in the header.
4. **Component.** Copy the gallery piece the job already has: header, filter row, note card, comment thread, task row, detail panel, or the closest control. Do not restyle that piece. If the gallery already has the component, use that one. Do not draw a second search, a second filter, or a second combination beside it. A list of similar items can be cards. One thing sits on the page. A table is for many records. A menu is for options that already exist. A modal is the delete confirmation, or a lesson card. Inline first.
5. **Surface and layer.** Decide the ground, then take one step from it. A hairline is 1px `--line`. Two strokes on one edge read as a thicker line. A tooltip is the top layer. Menus, the filter row, and the detail panel use the stack in [foundations.md](references/foundations.md). A new overlay does not invent a z-index.
6. **Type and spacing.** Plus Jakarta Sans. Hierarchy is a size step plus an ink step, with weight 500 only where the gallery already uses it (a record title, a section label, a place). 4px-based steps from `--space-2` through `--space-25`. Inside a control, use that component's padding. Between groups, use the larger steps. Do not loosen an icon gap to invent room, and do not tighten a section gap down to an item gap.
7. **Colour roles.** The neutral carries structure. `--action` is the one blue, for the primary, the open row, a switch that is on, and a progress fill. `--destructive` is the one red, for a danger button. A department or an urgency carries identity, as the gallery chip, and never ranks the page. Status wins a clash with a row hover: the open to-do stays `--filter-chip-bg` with a 1px `--action` box.
8. **Motion gate.** Should it move at all? The more often it is seen, the less it moves. A table row does not fade its wash. A keyboard action snaps. If it moves: name one purpose, animate only the properties that change, use the curves in [polish.md](references/polish.md), keep everyday UI under 300ms, make the exit about 20% faster, and ship a reduced-motion version that keeps the static cue.
9. **Review.** Walk [quality-checklist.md](references/quality-checklist.md) for the rows this change could break. Check both themes when dark is in play. Look for a double hairline, a sibling that does not match, a label that wraps, a column header on the wrong track, and a hover that restyles a fact.

## Rules at a glance

Open the reference for the measurement. These are the roles.

### Surface and ink

Every part comes from the parent. Hover and selected share one step. If that step is still invisible, take the next one on the ladder. Do not invent a grey.

| Part | Light | Dark |
| --- | --- | --- |
| Page | `--white` via `--bg-surface` | `--white` is `#212121` |
| Chrome (nav, chat, department bar) | `--sidebar-grey` | `#1A1A1A`, darker than the page |
| Hover and selected on the page | `--sidebar-grey` | `--grey` (`#292929`), lighter than the page |
| Hover on that chrome, or the next step | `--grey` | `--black-12` |
| One step past a hovered row | `--black-12` | `--grey-up` only for a photo or an off switch track that would otherwise match. A text chip does not use it |
| Strong text | `--black` | `#EEEEEE` |
| Secondary text | `--text-muted` | `#B5B5B5` |
| Hairline | 1px `--line` (`--grey`) | 1px `--line` (`#313131`). A divider in the same token as the fill behind it disappears |
| Stroke | `--stroke`, 1px `--grey` | `--stroke` follows the dark line |
| Menu and toast | `--elevation-menu` | the same shadow token, recolored |
| Photo edge | `--outline-image`, black at 10%, inset | white at 10%, inset. Not the hairline |

- **White on white** gets its edge from `--stroke` or from the one-step fill, not from a second shadow recipe.
- **A fact stays.** An urgency in a table or a menu keeps its text color and has no fill. Standard's word stays `--black-50`. A department fill stays on hover and while its menu is open, except in a menu, where the type is the dot. A filter chip keeps `--filter-chip-bg`. A photo on a light row does not change. Button text stays.

### Type

| Role | Default | Rule |
| --- | --- | --- |
| Face | Plus Jakarta Sans, 400 and 500 | Switzer is the dev switch only. Libre Baskerville is an editorial moment the gallery already uses |
| Record title | 16 / 500 | Not the name of a table. A table's own title is on Table in [components.md](references/components.md) |
| Page title, body, button | 14 / 400 | The page title is `--black`, including the parent you click to go back. The count is 14 / 400 in `--text-muted` |
| Place | 14 / 500 | |
| Section label, note, meta | 12 | Label is 500 in `--text-muted`. Meta is 400 in `--text-muted` |
| Filter | 10 / 400 | |
| Side title | `--text-20` | |
| Chip | 13 / 400, line-height 16px | A department, an urgency, a status, and a name, outside a menu. Inside a menu every option is `--text-14`. See Menu in [components.md](references/components.md) |
| Figures | `--numeric` | Counts and prices. Not a phone, a zip, or a version |
| Duration | `36s`, `30m`, `1h`, `1h 2m` | One letter, no space between the number and the letter. `s` seconds, `m` minutes, `h` hours, `d` days. A zero unit is left out. Units keep one space: `1h 2m`, `1h 10m`, `1m 30s` |

A measured length of time uses that form. `40m`, `1h`, `1h 2m`, `7d`, and `36s` are the form. A clock, a date, and a running timer stay as they are.

A component's own type, including a chip, a menu option, and a lesson title, is on that component.

### Buttons and controls

Size, fill, and states for each control are on that component in [components.md](references/components.md). They are not repeated here.

Primary button, secondary button, tertiary button, danger button, filter chip, icon button, add row, field, line field, text well, search, switch.

Press, hit area, and disabled behavior that every control shares are in [polish.md](references/polish.md).

### Surfaces

Each surface's size is on that component in [components.md](references/components.md): Sidebar, Header, Page layout, Detail panel, Lesson card, Menu, Delete confirmation, Toast, Tooltip, Table, Section card, Editor popup, Inset card.

| Item | Default |
| --- | --- |
| Layers | Tooltip on top. Then confirmation, then a menu that must clear the panel (80), the detail panel (60), the filter row (50). Do not mint a new z-index |

### Layout

| Item | Default |
| --- | --- |
| Subpage | Content within 820px. Top-right is back. Primary sits in the content |
| Notes columns | List 375px. The center holds 895px between the nav and the chat so the meta row fits |
| Resize | Collapse the nav first, under 1564px. Collapse the chat second, under 1341px. Do not squeeze or hide either. A manual expand stays open |
| Section rhythm | The gap inside a group is smaller than the gap between groups. On a lesson card those are `--space-4` and `--space-25`. Another screen keeps the gap its component already uses |
| Title and content | At least 40px. A title and the content it names do not sit closer than 40px. A subtitle that belongs to the title stays `--space-4` |
| Person, room, filter | See Person and Room in [components.md](references/components.md). The filter row is in [patterns.md](references/patterns.md) |
| Empty | The empty this product already uses: "Title" and "New note", a quiet dash, a dashed avatar, "Location" and "Item". Do not invent one |
| Actions | One primary, where the person is already looking. Any destructive action opens Delete confirmation first. A trash icon and a Delete button are the same press. A new record is created on the page, not in a prompt |

### Motion

| Item | Default |
| --- | --- |
| Curve, enter or leave | `--ease-out`, `cubic-bezier(0.23, 1, 0.32, 1)`. Not the built-in `ease-out`. Not `ease-in` |
| Curve, on-screen morph | `--ease-in-out`, `cubic-bezier(0.77, 0, 0.175, 1)` |
| Curve, drawer | `--ease-drawer`, `cubic-bezier(0.32, 0.72, 0, 1)` |
| Hover color | `ease`, `--motion-hover` (120ms), on `background-color`, `color`, and `box-shadow` only |
| Press | `scale(0.98)`, 160ms, `--ease-out` |
| Row hover | No fade. A row someone scans does not ease its wash |
| Keyboard | Snaps. Enter, Space, Escape, and shortcuts do not fade or travel |
| Removal | Closes the gap. Completing holds 700ms, then leaves. The count updates when it leaves |
| Reduced motion | Keep the color, icon, or label. Drop the movement |

## Never ship

- [ ] A restyle of a component the gallery already has. Search, the filter row, a button, a menu, the sidebar, the header, a table, and a side panel keep the drawing in their own section. A screenshot is not a reason to redraw one
- [ ] A second primary on a surface, or a primary that is not the real next step
- [ ] A header button with no icon
- [ ] A second blue, or a second red. A danger button that is a white line. Danger is the fill or the light red
- [ ] A raw hex, a raw font size, or a raw spacing step where a token, role, or alias already exists
- [ ] A dark-mode style that changes padding, height, radius, or type
- [ ] A hover or selected fill that skips the ladder, or a second step on an already-selected control
- [ ] A hover that recolors an urgency, a department fill, a filter chip, button text, or a photo on a light row
- [ ] A hairline that is not 1px, or two strokes stacked on one edge
- [ ] A new z-index. A tooltip that sits under the page, the table, or the sidebar, or that hides on click
- [ ] A press that darkens the fill, scales past `0.98`, or scales a disabled control
- [ ] `transition: all`, `ease-in` on UI, or an entrance from `scale(0)`
- [ ] A fade on a table-row hover, or motion on a keyboard action
- [ ] A removal that leaves a gap, or a complete that snaps out before the 700ms hold
- [ ] A person, an urgency, or a type that does not follow its component. A named pill in an Assigned column
- [ ] A typed person or a typed room. A new person added anywhere but Settings
- [ ] A filter that clears the other checks, or a menu that closes when one option is chosen
- [ ] A menu that does not follow Menu in [components.md](references/components.md)
- [ ] Shared chrome restyled per page: the sidebar, the header, a table, a side panel
- [ ] An extra card around one action, or a matching fill on every section of a long record
- [ ] A subpage wider than 820px, or a primary in a subpage's top-right
- [ ] An invented empty, an invented error, or a loader other than the table skeleton
- [ ] An icon that does not follow the Internal notes construction, or two constructions in one menu
- [ ] A follow-up that restyles the neighbours of the control the user pointed at
- [ ] A measured duration written out or padded like a clock. `40 min`, `1 hour`, and `01:02` are `40m`, `1h`, and `1h 2m`. A running timer stays `mm:ss`

When reviewing UI, use one markdown table. One row per issue. Name the current value, the value this system uses, and the reason.

| Before | After | Why |
| --- | --- | --- |
| `scale(0.9)` on press | `scale(0.98)` | A press stays in the range in polish. This gallery uses `0.98` |

## References

Open the one file that matches the task. Read a second only when the task crosses it. A follow-up reads guard rails for scope, then the file for the thing being fixed. Screen-only note layout is not in this catalog. The measurements in each reference are the spec.

| Task | Read |
| --- | --- |
| Tokens, color, type, space, radius, shadow, dark mode, scrollbar, hover, what stays, or layering | [foundations.md](references/foundations.md) |
| A named component, including a button, a person, an urgency, a type, the sidebar, a table, or a popup | [components.md](references/components.md) |
| A screen, the job sentence, spacing a screen, or a block | [patterns.md](references/patterns.md) |
| Motion, wrapping, hit area, overflow, icons, containers | [polish.md](references/polish.md) |
| A follow-up, a selected node, spacing, a hairline, collapse, or an input state | [guard-rails.md](references/guard-rails.md) |
| Before calling UI work done | [quality-checklist.md](references/quality-checklist.md) |

- [foundations.md](references/foundations.md): roles, the ink ladder, what changes and what stays, layering, dark mode, type, space, radius.
- [components.md](references/components.md): when to use each control, and that control's size, fill, and states. A one-line input box is 32px. A description or notes field is the text well, 96px.
- [patterns.md](references/patterns.md): the job, spacing a screen, and the blocks. A person, an urgency, and a type are named there only as a pointer to the component.
- [polish.md](references/polish.md): the motion decision, curves, durations, icons, fewer containers.
- [guard-rails.md](references/guard-rails.md): corrections that came back more than once. Follow them with the component spec.
- [quality-checklist.md](references/quality-checklist.md): the rows to walk before calling UI work done.
