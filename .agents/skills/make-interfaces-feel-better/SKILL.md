---
name: make-interfaces-feel-better
description: >-
  Design engineering principles for making interfaces feel polished. Use when building UI components, reviewing frontend code, implementing animations, hover states, shadows, borders, typography, icons, micro-interactions, enter/exit animations, or any visual detail work. A review uses a Before / After / Why table. Triggers on UI polish, design details, "make it feel better", "feels off", stagger animations, border radius, optical alignment, font smoothing, tabular numbers, image outlines, box shadows, icons, icon stroke weight, icon states, motion restraint.
---

# Details that make interfaces feel better

Great interfaces rarely come from a single thing. It's usually a collection of small details that compound into a great experience. Apply these principles when building or reviewing UI code. Before suggesting or writing a fix, identify the project's existing styling system and express the change in that system: Tailwind in a Tailwind project, plain CSS in a CSS project, or the established CSS-in-JS approach. Never introduce a second styling system just to apply a polish fix.

When reviewing, slow the interface down: replay motion at 10% speed in the browser's Animations panel and walk every state: hover, focus, active, loading, empty. What feels off at 10% speed is what's subtly wrong at full speed.

## Quick Reference

| Category | When to Use |
| --- | --- |
| [Typography](typography.md) | Text wrapping, font smoothing, tabular numbers |
| [Surfaces](surfaces.md) | Border radius, optical alignment, shadows, image outlines, hit areas |
| [Animations](animations.md) | Interruptible animations, enter/exit transitions, icon animations, scale on press, motion restraint |
| [Icons](icons.md) | The project's icon construction, states via `currentColor`, sizing, RTL flipping |
| [Performance](performance.md) | Transition specificity, `will-change` usage |

## Core Principles

### 1. Concentric Border Radius

Outer radius = inner radius + padding. Mismatched radii on nested elements is the most common thing that makes interfaces feel off.

### 2. Optical Over Geometric Alignment

When geometric centering looks off, align optically. Buttons with icons, play triangles, and asymmetric icons all need manual adjustment.

### 3. Shadows for Elevation, Borders for Structure

Keep the hairline and the menu shadow the project already has. Do not invent a second shadow recipe, and do not replace a button or card border with a layered shadow. Dividers stay a 1px border. A padding frame, a border, and a stroke do not stack on the same edge.

### 4. Interruptible Animations

Use CSS transitions for interactive state changes — they can be interrupted mid-animation. Reserve keyframes for staged sequences that run once.

### 5. Split and Stagger Enter Animations

For an infrequent staged entrance where sequence helps communicate hierarchy, break content into semantic chunks and stagger them by 30–80ms. Do not block interaction while that stagger plays. Do not stagger routine, high-frequency interactions. An entrance starts at `scale(0.95)` with opacity `0`. `scale(0.9)` or higher is acceptable. Nothing starts at `scale(0)`.

### 6. Subtle Exit Animations

Something leaving a list closes the gap. The rows below move up. Do not leave the hole, and do not snap the list shut. The exit is about 20% faster than the entrance, on the strong `--ease-out` curve (`cubic-bezier(0.23, 1, 0.32, 1)`), not the built-in `ease-out`. Completing an item shows the completed status, holds 700ms, then uses that same close-the-gap motion. Reduced motion keeps the status and the hold, and skips the movement.

### 7. Contextual Icon Animations

Animate icons with `opacity`, `scale`, and `blur` instead of toggling visibility. Use exactly these values: scale from `0.25` to `1`, opacity from `0` to `1`, blur from `4px` to `0px`. If the project has `motion` or `framer-motion` in `package.json`, match that package's import path (or the established nearby imports when both exist) and use `transition: { type: "spring", duration: 0.3, bounce: 0 }` — bounce must always be `0`. If no motion library is installed, keep both icons in the DOM (one absolute-positioned) and cross-fade with CSS transitions using `cubic-bezier(0.2, 0, 0, 1)` — this gives both enter and exit animations without any dependency.

### 8. Font Smoothing

Apply `-webkit-font-smoothing: antialiased` to the root layout on macOS for crisper text.

### 9. Tabular Numbers

Use `font-variant-numeric: tabular-nums` for any dynamically updating numbers to prevent layout shift.

### 10. Text Wrapping

Headings and titles of six lines or fewer use `text-wrap: balance`. Short UI copy uses `text-wrap: pretty`. Long text and code stay on the browser default.

### 11. Image Outlines

Add a subtle `1px` outline with low opacity to images for consistent depth. The color must be pure black in light mode (`oklch(0 0 0 / 0.1)`) and pure white in dark mode (`oklch(1 0 0 / 0.1)`), never a near-black like slate, zinc, or any tinted neutral. A tinted outline picks up the surface color underneath it and reads as dirt on the image edge.

### 12. Scale on Press

A press scales the whole control to `0.97`. `0.95`–`0.98` still reads as a press. Anything below `0.95` feels exaggerated. Duration is 100–160ms on the strong `--ease-out` curve. 160ms is the usual choice. Any pressable does this, including icon buttons, menu items, chips, and tabs. The hover fill stays. Press does not darken that fill. Reduced motion skips the scale.

### 13. Skip Animation on Page Load

Use `initial={false}` on `AnimatePresence` to prevent enter animations on first render. Verify it doesn't break intentional entrance animations.

### 14. Never Use `transition: all`

Always specify exact properties: `transition-property: scale, opacity`. Tailwind's `transition-transform` covers `transform, translate, scale, rotate`.

### 15. Use `will-change` Sparingly

Only for `transform`, `opacity`, `filter` — properties the GPU can composite. Never use `will-change: all`. Only add when you notice first-frame stutter.

### 16. Minimum Hit Area

Interactive elements should prefer a 44×44px hit area for touch or mobile contexts. In dense desktop interfaces, use at least 40×40px. Extend with a pseudo-element if the visible element is smaller. Never let hit areas of two elements overlap.

### 17. Match Icon Stroke to Text Weight

Match the icon construction the project already uses. One stroke weight for the set. In this system the painted stroke is `1`, and new icons are outlined glyphs fitted the same way. Do not assign `1.5px`, `2px`, or `2.5px` unless the project already draws icons that way.

### 18. One SVG, Recolored per State

Icons use `currentColor`. Color and opacity carry hover, selected, and disabled. Outline is the resting state. Do not swap in a filled glyph for the active state, except where the project already fills that icon.

### 19. Motion Restraint

Something used 100 or more times a day, including a keyboard action, does not animate. Something used tens of times a day, including a table row, gets no hover animation or a drastically reduced one. Motion is never the only feedback channel; every animated state change also needs a static cue such as color, icon, or label. Use the strong curves: `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer` `cubic-bezier(0.32, 0.72, 0, 1)`. A hover color uses plain `ease`. The built-in `ease-out` is too weak. A drag, a gesture, or a decorative follow uses a spring at `0.5s` with bounce `0.1`–`0.3`. Icon swaps are the exception in principle 7. A modal or drawer may run 200–500ms. Everyday UI stays under 300ms. Do not add Tailwind or a motion library the project does not already have.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Same border radius on parent and child | Calculate `outerRadius = innerRadius + padding` |
| Icons look off-center | Adjust optically with padding or fix SVG directly |
| A new shadow recipe on a button or card | Keep the project's hairline and menu shadow. Dividers stay 1px borders |
| Jarring staged entrance or a list that snaps shut | Stagger infrequent entrances by 30–80ms from `scale(0.95)`. A list exit closes the gap and is faster than the entrance |
| Numbers cause layout shift | Apply `tabular-nums` |
| Heavy text on macOS | Apply `antialiased` to root |
| Animation plays on page load | Add `initial={false}` to `AnimatePresence` |
| `transition: all` on elements | Specify exact properties |
| First-frame animation stutter | Add `will-change: transform` (sparingly) |
| Tiny hit areas on small controls | Extend with a pseudo-element to 44×44px for touch/mobile, or at least 40×40px in dense desktop UI |
| A thicker stroke than the project's icons | Match the existing construction. Here the painted stroke is `1` |
| Separate icon assets per state | One `currentColor` SVG. Color and opacity carry the state |
| Filled glyph swapped in for active | Outline stays the resting state, except where the project already fills |
| A fade on a table row or a keyboard action | No animation, or a drastically reduced one. Keyboard actions snap |

## Review

When reviewing UI, use one markdown table. One row per issue. Never use separate "Before:" / "After:" lines.

| Before | After | Why |
| --- | --- | --- |
| `scale(0.9)` on press in `src/button.css` | `scale(0.97)` over 160ms on `--ease-out` | A press stays in the `0.95`–`0.98` range |

Put the file and line in the Before cell when there is source to point at. Consolidate a repeated issue into one row. When there are no findings, say so in a sentence.
