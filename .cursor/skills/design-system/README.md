# Design-system skill

A skill that teaches an AI agent how to design and build UI for Lance's hotel operations product. It covers what the product looks like and how it behaves, and the reasoning behind each choice, so the agent can make new screens that fit.

The agent reads `SKILL.md` when a task touches UI: building a screen, restyling a component, reviewing a page, or a small "fix this" on a selected element. It then opens only the reference file that task needs.

## What it teaches

The product is **tactile, layered and quiet**:

- **The page is the surface.** Controls take one step from whatever they sit on, and squeeze slightly when pressed.
- **One blue action** says what to do next, and one red is kept for danger.
- **Facts stay put.** A person, a department, an urgency or a photo doesn't restyle when you hover the control around it.
- **Hierarchy comes from a size step and an ink step,** not from new colors or stacked boxes.

Rules are written as roles and ratios, such as "one step from its ground" or "the gap inside a group is smaller than the gap between groups". The real values live in `catalog/tokens.css`, so the rules hold even when a project styles things differently.

## How the agent works through a task

`SKILL.md` sets a fixed decision order, because most weak UI comes from starting at the component:

1. **Hierarchy:** the one next action on the screen, or none.
2. **Amount of data:** the least that answers the question.
3. **Placement:** where the action and controls sit.
4. **Component:** reuse the gallery's piece as it is.
5. **Surface and layer:** decide the ground, then take one step from it.
6. **Type and spacing.**
7. **Color roles.**
8. **Motion:** whether it should move at all.
9. **Review:** walk the quality checklist.

It also sets a working posture: make the smallest change that fixes it, reuse before inventing, never restyle an existing component, remove before adding, and apply a decided rule everywhere at once.

## Files

| File | Read it for |
| --- | --- |
| `SKILL.md` | The entry point: vocabulary, posture, the decision order, rules at a glance, and the "never ship" list. |
| `references/foundations.md` | Tokens, color roles, the ink ladder, dark mode, type, space, radius, strokes and layering. |
| `references/components.md` | Every component: when to use it, when not to, its default, and its states. Each section feeds that component's Usage tab in the gallery. |
| `references/patterns.md` | Whole screens: the job sentence, spacing a screen, and recurring blocks. |
| `references/polish.md` | Motion, curves and durations, icons, wrapping, hit areas, and fewer containers. |
| `references/guard-rails.md` | Corrections that came up more than once, such as "header icons are grey" or "one hairline". |
| `references/quality-checklist.md` | The rows to check before calling UI work done. |
| `catalog/` | A copy of the gallery and its CSS: `tokens.css`, `gallery.css`, `todos-alt.css`, `index.html`, `notes.html`. It travels with the skill so it works in projects that don't have this repo. |

## Using it

**In this repo,** it's already active: Cursor finds it in `.cursor/skills/`, and `.cursor/rules/design-system.mdc` points every UI edit at it. Here, `css/` at the repo root is the source and `catalog/` is a copy. Edit `css/`, then run `npm run sync`.

**In another project,** copy this whole `design-system` folder into that project's `.cursor/skills/`. The agent then reads values from `catalog/` and applies them in whatever styling the project already uses. If the project has the live files (`css/tokens.css` and so on), those take precedence over the copy.

## Changing a rule

1. Edit the section that owns the rule. A component's sizes, fills and exceptions stay in that component's section in `components.md`, not in `SKILL.md` or the checklist.
2. If the same correction keeps coming back, add it to `guard-rails.md`.
3. In this repo, run `npm run usage` so the gallery's Usage tab matches, then `npm run check:design`.
