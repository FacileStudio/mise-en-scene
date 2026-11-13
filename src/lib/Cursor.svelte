<script module lang="ts">
	import type { CursorState } from './act.js';

	export interface CursorProps {
		/** The cursor's position and state; keep it in `$state(cursorAt())` and move it with `act.move`. */
		cursor: CursorState;
	}
</script>

<script lang="ts">
	let { cursor }: CursorProps = $props();
</script>

<!--
@component
The macOS arrow, from Stageshow's kit glyph, drawn in `fc-fg` with an `fc-page` edge so it inverts with the theme. Travel is CSS on the travel curve, so a script only sets
`x` and `y` (through `act.move`) and waits. Place it last in the stage so it paints above everything.
-->

<svg
	class="mes-cursor"
	style:translate="{cursor.x}px {cursor.y}px"
	style:opacity={cursor.visible ? 1 : 0}
	style:scale={cursor.down ? 0.88 : 1}
	width="17"
	height="22"
	viewBox="0 0 13 19"
	aria-hidden="true"
>
	<path d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z" class="mes-cursor-edge" />
	<path d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z" class="mes-cursor-fill" />
</svg>

<style>
	.mes-cursor {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 30;
		pointer-events: none;
		transform-origin: 0 0;
		filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.2));
		transition:
			translate 0.9s cubic-bezier(0.45, 0, 0.1, 1),
			opacity 0.3s ease,
			scale 0.12s ease;
	}
	.mes-cursor-edge {
		fill: var(--color-fc-page);
	}
	.mes-cursor-fill {
		fill: var(--color-fc-fg);
	}
	@media (prefers-reduced-motion: reduce) {
		.mes-cursor {
			transition: none;
		}
	}
</style>
