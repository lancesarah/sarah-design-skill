# Animations

Interruptible animations, enter/exit transitions, contextual icon animations, and motion restraint.

## Interruptible Animations

Users change intent mid-interaction. If animations aren't interruptible, the interface feels broken.

### CSS Transitions vs. Keyframes

| | CSS Transitions | CSS Keyframe Animations |
| --- | --- | --- |
| **Behavior** | Interpolate toward latest state | Run on a fixed timeline |
| **Interruptible** | Yes — retargets mid-animation | No — restarts from beginning |
| **Use for** | Interactive state changes (hover, toggle, open/close) | Staged sequences that run once (enter animations, loading) |
| **Duration** | Fixed; retargets the value mid-flight, not the timeline | Fixed timeline, restarts from the beginning |

```css
/* Good — interruptible transition for a drawer.
   200–500ms on the drawer curve. Exit is about 20% faster than the entrance.
   Everyday UI stays under 300ms. Built-in ease-out is too weak. */
.drawer {
  transform: translateX(-100%);
  transition: transform 400ms cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer.open {
  transform: translateX(0);
}

/* Clicking again mid-animation smoothly reverses — no jank */
```

```css
/* Bad — keyframe animation for interactive element */
.drawer.open {
  animation: slideIn 400ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

/* Closing mid-animation snaps or restarts — feels broken */
```

**Rule:** Always prefer CSS transitions for interactive elements. Reserve keyframes for one-shot sequences.

## Enter Animations: Split and Stagger

Use this pattern for infrequent staged entrances where sequence helps communicate hierarchy, such as a rare first-time moment. Break a large container into semantic chunks and animate each individually. Do not stagger routine interactions such as row hovers, keystrokes, or repeated tab changes. Do not block interaction while the stagger plays.

### Step by Step

1. **Split** into logical groups (title, description, buttons)
2. **Stagger** by 30–80ms between groups
3. **Start** at `scale(0.95)` with opacity `0`. `scale(0.9)` or higher is acceptable. Do not start at `scale(0)`

### Code Example

```tsx
// Motion (Framer Motion) — staggered enter
function PageHeader() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      <motion.h1
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
      >
        Welcome
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
      >
        A description of the page.
      </motion.p>

      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
      >
        <Button>Get started</Button>
      </motion.div>
    </motion.div>
  );
}
```

### CSS-Only Stagger

```css
.stagger-item {
  opacity: 0;
  transform: scale(0.95);
  animation: fadeIn 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## Exit Animations

The exit is about 20% faster than the entrance. Something leaving a list closes the gap: the rows below move up. Do not leave the hole, and do not snap the list shut. Completing an item shows the completed status immediately, holds for 700ms, then uses that same close-the-gap motion. Reduced motion keeps the status and the hold, and skips the movement.

The rows below take the freed space. Do not leave the gap. Do not snap the list shut. A drawer that entered over 400ms leaves over about 320ms on the drawer curve. Keyboard actions and other all-day controls do not animate on the way out.

## Contextual Icon Animations

When icons appear or disappear contextually (on hover, on state change), animate them with `opacity`, `scale`, and `blur` rather than just toggling visibility.

### Motion Example

This example uses the `motion` package. If the project instead has `framer-motion`, import the same APIs from `"framer-motion"`; never mix an installed package with the other package's import path.

```tsx
import { AnimatePresence, motion } from "motion/react";

function IconButton({ isActive, icon: Icon }) {
  return (
    <button>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isActive ? "active" : "inactive"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```

### CSS Transition Approach (No Motion)

If the project doesn't use Motion (Framer Motion), keep both icons in the DOM and cross-fade them with CSS transitions. Because neither icon unmounts, both enter and exit animate smoothly.

The trick: one icon is absolutely positioned on top of the other. Toggling state cross-fades them — the entering icon scales up from `0.25` while the exiting icon scales down to `0.25`, both with opacity and blur.

```tsx
function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  return (
    <button>
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-[opacity,filter,scale] duration-300",
            "ease-[cubic-bezier(0.2,0,0,1)]",
            isActive
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]"
          )}
        >
          <ActiveIcon />
        </div>
        <div
          className={cn(
            "transition-[opacity,filter,scale] duration-300",
            "ease-[cubic-bezier(0.2,0,0,1)]",
            isActive
              ? "scale-[0.25] opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-0"
          )}
        >
          <InactiveIcon />
        </div>
      </div>
    </button>
  );
}
```

The non-absolute icon (InactiveIcon) defines the layout size. The absolute icon (ActiveIcon) overlays it without affecting flow.

### Choosing Between Motion and CSS

| | Motion (Framer Motion) | CSS transitions (both icons in DOM) |
| --- | --- | --- |
| **Enter animation** | Yes | Yes |
| **Exit animation** | Yes (via `AnimatePresence`) | Yes (cross-fade — icon never unmounts) |
| **Spring physics** | Yes | No — use `cubic-bezier(0.2, 0, 0, 1)` as approximation |
| **When to use** | Project already uses `motion` or `framer-motion` | No motion dependency, or keeping bundle small |

**Rule:** Check the project's `package.json`. Import from `"motion/react"` when `motion` is installed, or from `"framer-motion"` when `framer-motion` is installed. If both exist, follow the imports already used by the component or its nearest peers. If neither is present, use the CSS cross-fade pattern — don't add a dependency just for icon transitions.

### When to Animate Icons

| Animate | Don't animate |
| --- | --- |
| Icons that appear on hover (action buttons) | Static navigation icons |
| State change icons (play → pause, like → liked) | Decorative icons |
| Icons in contextual toolbars | Icons that are always visible |
| Loading/success state indicators | Icon labels (text next to icon) |

**Important:** Always use exactly these values for contextual icon animations — do not deviate:
- `scale`: `0.25` → `1` (never use `0.5` or `0.6`)
- `opacity`: `0` → `1`
- `filter`: `"blur(4px)"` → `"blur(0px)"`
- `transition`: `{ type: "spring", duration: 0.3, bounce: 0 }` — **bounce must always be `0`**, never `0.1` or any other value

## Scale on Press

A press scales the whole control to `0.97`, label and icon included. `0.95`–`0.98` still reads as a press. Anything below `0.95` feels exaggerated. Duration is 100–160ms on the strong ease-out curve. 160ms is the usual choice. Any pressable does this, including icon buttons, menu items, chips, and tabs. The hover fill stays. Press does not darken that fill. Reduced motion skips the scale. Use a CSS transition so a release mid-press can retarget.

### CSS Example

```css
.button {
  transition-property: scale;
  transition-duration: 160ms;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

.button:active {
  scale: 0.97;
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}
```

### Tailwind Example

Use Tailwind only when the project already uses it.

```tsx
<button className="transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]">
  Click me
</button>
```

### Motion Example

Use a motion library only when the project already has one.

```tsx
<motion.button whileTap={{ scale: 0.97 }}>
  Click me
</motion.button>
```

## Skip Animation on Page Load

Use `initial={false}` on `AnimatePresence` to prevent enter animations from firing on first render. Elements that are already in their default state shouldn't animate in on page load — only on subsequent state changes.

### When It Works

```tsx
// Good — icon doesn't animate in on mount, only on state change
<AnimatePresence initial={false} mode="popLayout">
  <motion.span
    key={isActive ? "active" : "inactive"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
  >
    <Icon />
  </motion.span>
</AnimatePresence>
```

Works well for: icon swaps, toggles, tabs, segmented controls — anything that has a default state on page load.

### When It Breaks

Don't use `initial={false}` when the component relies on its `initial` prop to set up a first-time enter animation, like a staggered page hero or a loading state. In those cases, removing the initial animation skips the entire entrance.

```tsx
// Bad — initial={false} would skip the staggered page enter entirely
<AnimatePresence initial={false}>
  <motion.div initial="hidden" animate="visible" variants={...}>
    ...
  </motion.div>
</AnimatePresence>
```

Verify the component still looks right on a full page refresh before applying this.

## Motion Restraint

Motion is a budget, not a garnish:

- **No custom animation on high-frequency interactions.** Something used tens of times a day, including a table row, gets no hover animation or a drastically reduced one. A keyboard action snaps.
- **Motion is never the only feedback channel.** Every animated state change also needs a static cue such as color, icon, or label.
- **Brief and precise beats prominent.** If a shorter, smaller animation communicates the same thing, use it.
- **Honor reduced-motion preferences.** Preserve the static cue and remove unnecessary movement.

```css
/* Good: a row someone scans does not fade */
.row:hover {
  background-color: var(--surface-hover);
}

/* Bad: every hover replays a full entrance */
.row:hover .row-icon {
  animation: bounceIn 500ms;
}
```
