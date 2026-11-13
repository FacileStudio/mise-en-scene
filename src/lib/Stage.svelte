<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { Script } from './act.js';

	export interface StageSize {
		width: number;
		height: number;
	}

	export interface StageLayout {
		compact: boolean;
		scale: number;
	}

	export interface StageProps {
		/** The design size, in pixels, the scene is laid out at. The stage scales it to fit its host. */
		width: number;
		height: number;
		/** A second design for narrow hosts, used below `below` pixels of host width. */
		compact?: StageSize & { below: number };
		/**
		 * The scene's script. It loops while the stage is on screen and the tab is visible. Omit it for a
		 * still, which shows `poster`.
		 */
		script?: Script;
		/** Puts the scene back on its opening frame; called before each run and when playback stops. */
		reset?: () => void;
		/** Puts the scene on the frame that tells the story alone; shown under reduced motion and for a still. */
		poster?: () => void;
		/** How much of the stage must be visible before the script starts. */
		threshold?: number;
		/** Accessible description; the scene itself is hidden from assistive tech. */
		label?: string;
		class?: string;
		children: Snippet<[StageLayout]>;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { createAct } from './act.js';
	import { director, inView } from './director.js';

	let {
		width,
		height,
		compact,
		script,
		reset,
		poster,
		threshold = 0.35,
		label,
		class: className = '',
		children
	}: StageProps = $props();

	let hostWidth = $state(0);
	let stage = $state<HTMLElement>();

	const isCompact = $derived(!!compact && hostWidth > 0 && hostWidth < compact.below);
	const design = $derived(isCompact && compact ? compact : { width, height });
	const scale = $derived(hostWidth ? Math.min(1, hostWidth / design.width) : 1);

	function play(node: HTMLElement) {
		const run = script;
		if (!run) {
			untrack(() => poster?.());
			return;
		}
		const cast = director({ run: (signal) => run(createAct(signal, () => stage, () => scale)), reset, poster });
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const onMotion = () => cast.update({ reduced: motion.matches });
		const onVisibility = () => cast.update({ hidden: document.hidden });
		const observer = new IntersectionObserver(([entry]) => cast.update({ onScreen: inView(entry, threshold) }), {
			threshold: [0, threshold]
		});
		untrack(() => cast.update({ reduced: motion.matches, hidden: document.hidden }));
		observer.observe(node);
		motion.addEventListener('change', onMotion);
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			observer.disconnect();
			motion.removeEventListener('change', onMotion);
			document.removeEventListener('visibilitychange', onVisibility);
			cast.halt();
		};
	}
</script>

<!--
@component
The shot. Lays the scene out at its design size, scales it down to the host, swaps to the compact
design on narrow hosts, loops the script only while on screen with the tab in front, and shows the
poster frame under reduced motion. Everything inside is decorative: hidden from assistive tech and
inert. The host reserves its height from the design's aspect ratio, so server-rendered pages do not
jump or overflow before the stage measures its width.
-->

<div
	class="mes-host {className}"
	style:aspect-ratio="{design.width} / {design.height}"
	style:max-height="{design.height}px"
	bind:clientWidth={hostWidth}
	role={label ? 'img' : undefined}
	aria-label={label}
	{@attach play}
>
	<div
		bind:this={stage}
		class="mes-stage"
		data-layout={isCompact ? 'compact' : 'wide'}
		style:width="{design.width}px"
		style:height="{design.height}px"
		style:transform="translateX(-50%) scale({scale})"
		style:visibility={hostWidth ? undefined : 'hidden'}
		aria-hidden="true"
		inert
	>
		{@render children({ compact: isCompact, scale })}
	</div>
</div>

<style>
	.mes-host {
		position: relative;
		width: 100%;
		overflow: hidden;
		font-family: var(--font-sans);
	}
	.mes-stage {
		position: absolute;
		top: 0;
		left: 50%;
		overflow: hidden;
		transform-origin: top center;
		text-align: left;
	}
</style>
