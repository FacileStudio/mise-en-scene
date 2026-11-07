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
		/** The scene's script; it loops while the stage is on screen. Omit it for a still. */
		script?: Script;
		/** Puts the scene back on its opening frame; called when the stage leaves the screen. */
		reset?: () => void;
		/** Puts the scene on the frame that tells the story alone; shown under reduced motion. */
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
	import { createAct, loop, prefersReducedMotion } from './act.js';

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
		if (prefersReducedMotion()) {
			poster?.();
			return;
		}
		if (!script) return;
		const run = script;
		let controller: AbortController | null = null;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !controller) {
					const current = new AbortController();
					controller = current;
					const act = createAct(current.signal, () => stage, () => scale);
					void loop(() => run(act), current.signal);
				} else if (!entry.isIntersecting && controller) {
					controller.abort();
					controller = null;
					reset?.();
				}
			},
			{ threshold }
		);
		observer.observe(node);
		return () => {
			observer.disconnect();
			controller?.abort();
		};
	}
</script>

<!--
@component
The shot. Lays the scene out at its design size, scales it down to the host, swaps to the compact
design on narrow hosts, loops the script only while on screen and shows the poster frame under
reduced motion. Everything inside is decorative: hidden from assistive tech and inert.
-->

<div
	class="mes-host {className}"
	style:height="{design.height * scale}px"
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
