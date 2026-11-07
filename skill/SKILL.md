---
name: mise-en-scene
description: Build faux product UI in Svelte 5 that looks like the real product, as a still or an animated demo with a cursor, using the @facile/mise-en-scene kit. App windows, chat threads, terminals, bento tiles and cursor walkthroughs for landing-page heroes, feature cards and docs. Use whenever someone wants a fake or mocked UI, a product demo or walkthrough animation, a hero or feature-card illustration of an app, or an animated cursor doing things in an interface, in a Svelte or SvelteKit project, even if they never say "faux UI". The Svelte port of Stageshow.
---

# mise-en-scene

Miniature product UI: a believable interface, framed in its space, as one still or a short animation in which one thing happens. The viewer recognizes the screen and sees the thing happen. This is Stageshow's method (Benji Taylor, MIT) rebuilt for Svelte 5 and the Facile suite.

## The one idea

**It reads as a real product, simplified to what the viewer needs, framed with intent, and every motion has a cause.**

Five ways it fails:

- **Too much.** Real text in every row, numbers everywhere, everything packed.
- **Wireframe.** Two gray blobs and a button. Built too small, or stripped of what made it recognizable.
- **Boxed.** A whole app shrunk into a card with even margins and nothing happening.
- **Flat.** Every object the same weight. The eye has nowhere to land.
- **Bland.** A gray window with a cursor, whatever the brief said.

The fix: a full, structured screen in quiet grays, real words only on what the story is about, `Bar` placeholders for the rest, room to breathe.

## Facile rules

These come from the suite owner and override the references where they differ.

- **Copy the real component before drawing it.** Open the app's own component (composer, message, tool card, approval card) and reuse its classes, radii, fills and icons. A demo composer that is a rounded rectangle when the app's is a pill reads as a different product. Never draw a product part from memory.
- **Windows stay whole.** All four corners rounded, the full shadow inside the stage. Do not bleed a window off the stage edge; a satellite chip may straddle its corner.
- **No borders, anywhere.** Depth from fills, surface steps and shadow. `Window` already steps its surfaces in dark mode.
- **No decorative glow** or blurred blobs behind a demo. The page is the ground.
- **Every visible string is translated.** Demo copy goes into the app's i18n catalogs in all four locales (en, fr, es, de). Identifiers, commands, file paths and branch names stay as they are.
- **A demo gets a section title** when a section follows it; tiles carry their own title and one line of copy.
- **Svelte 5 runes only**, muse tokens (`--color-fc-*`) for color, the app's own `Icon` set.

## Workflow

Write the plan first: where it sits, the focal object, the action, the payoff, what can be left out.

1. **Medium and place.** Still or loop. The page, its width. Design at the size it is seen: about 960 × 580 for a full-width hero under copy, 720 × 480 beside copy, 320 × 240 for a bento tile. Every scene that can sit in a phone column gets a `compact` design at 358 wide: a redesign (drop the sidebar, move the status into the title bar), not a squeeze.
2. **Look.** The product's tokens and components (Facile rules above). Light first, then check dark.
3. **The story.** Three to five beats and a payoff, 10 to 16 seconds. No cursor move you cannot explain. The payoff holds about 2 seconds, then everything the story added leaves as one motion and the loop restarts within a second.
4. **Start from an example.** Copy the closest scene from `examples/` (`AgentChat` for a hero with a cursor and an approval, `TerminalTile` for a tile) and replace its content with the product's. Read `references/craft.md` and `references/framing.md` before changing the frame.
5. **The screen.** Count the real strings: usually 3 to 7. Everything else is `Bar`. Mark what the cursor touches with `bind:this` and measure it with `act.point`; never hard-code coordinates.
6. **Choreograph.** Keep things mounted and toggle them so exits animate. Use `grow` for anything that joins a list, so it carries the rows below it. Put spacing inside the growing element (padding), not in the parent's `gap`. Text that changes rolls (`Roll`); an answer streams (`Stream`).
7. **Rehearse.** Write `poster` first: the frame a reduced-motion visitor sees. Then film the loop (below) at the shown width and at 390, in light and dark, and read every frame. Fix framing first, then hierarchy, then motion, then polish. Faults that come back every time: a void where the eye lands, words under an overlapping panel, a label that wraps at compact width, a surface that vanishes in dark mode, a cursor covering the label it clicks.

## The kit

```bash
bun add "github:FacileStudio/mise-en-scene#v0.1.0"
```

```svelte
<script lang="ts">
	import { tick } from 'svelte';
	import { Stage, Window, Cursor, Bar, Stream, cursorAt, grow, type Act } from '@facile/mise-en-scene';

	let sent = $state(false);
	let cursor = $state(cursorAt());
	let button = $state<HTMLElement>();

	function reset() {
		sent = false;
		cursor.visible = false;
	}

	async function script(act: Act) {
		await act.wait(800);
		sent = true;
		await tick();
		cursor.visible = true;
		await act.move(cursor, act.point(button, 0.9, 0.78));
		await act.click(cursor);
		await act.wait(2000);
		reset();
	}
</script>

<Stage width={960} height={580} compact={{ below: 640, width: 358, height: 560 }} {script} {reset} poster={() => (sent = true)}>
	{#snippet children({ compact })}
		<Window style="top:28px;left:72px;width:816px;height:516px">...</Window>
		<Cursor {cursor} />
	{/snippet}
</Stage>
```

- **`Stage`**: the shot. Lays the scene out at its design size and scales it to the host. Swaps to `compact` below a host width. Loops `script` only while on screen, calls `reset` when it leaves and shows `poster` under reduced motion. Its content is `aria-hidden` and `inert`; pass `label` for a description.
- **`Act`**: what a script gets. `wait(ms)`, `type(text, set, interval)`, `count(total, set, interval)`, `point(el, fx, fy)` (design pixels), `move(cursor, point, settle)`, `click(cursor, onPress)`. Every wait aborts when the stage leaves the screen.
- **`Window`**: desktop app frame, 38px title bar, optional full-height `sidebar` and `trailing` snippets. Position it with `style`.
- **`Cursor`**: the arrow. Set `x` and `y` through `act.move`; it travels on the travel curve.
- **`Bar`**: placeholder text, a tint of the foreground so it reads on every surface.
- **`Stream`**: an answer streaming word by word without reflow.
- **`Roll`**: a word that changes by rolling in its own cell.
- **`Terminal`** and **`Caret`**: a dark terminal panel and its block cursor.
- **`grow`**: the height-and-opacity transition for anything that joins a list.
- **`TRAVEL`**, **`ARRIVE`**: the two easing curves.

## Rehearse

```bash
mise run dev
bun scripts/film.ts "http://127.0.0.1:5184/?scene=agent-chat" --times 1500,4500,8800,12500 --out .film/chat
bun scripts/film.ts "<your page url>" --select ".mes-host" --width 390 --dark
```

The film script shoots the scene element at each time offset, counted from when it scrolled into view, and tiles the frames into `sheet.png` with ImageMagick. Read the sheet, fix the largest fault, film again. Restart the dev server if the frames show an old build: Vite does not watch `node_modules`.

## The references

`references/framing.md`: framing rules and layouts. `references/craft.md`: the still frame (restraint, type, spacing, icons, color). `references/motion.md`: story, loops, pace, the cursor. `references/bento.md`: grids of tiles. They are Stageshow's rules, unchanged; the Facile rules above win where they differ.
