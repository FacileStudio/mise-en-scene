<svelte:options css="injected" />

<script module lang="ts">
	export interface BarProps {
		/** Width: a CSS length, or a number of design pixels. */
		w?: string | number;
		/** Height in design pixels. */
		h?: number;
		/** Corner radius in design pixels; half the height by default. */
		r?: number;
		class?: string;
	}
</script>

<script lang="ts">
	let { w = '60%', h = 8, r, class: className = '' }: BarProps = $props();
</script>

<!--
@component
Placeholder text: the product's filler, never the subject. Vary widths row to row (60, 45, 70, 52%).
The tint is a share of the foreground, so it reads on any surface in light and dark.
-->

<span
	class="mes-bar {className}"
	style:width={typeof w === 'number' ? `${w}px` : w}
	style:height="{h}px"
	style:border-radius="{r ?? h / 2}px"
></span>

<style>
	.mes-bar {
		display: block;
		flex: none;
		background: color-mix(in oklch, var(--color-fc-fg) 9%, transparent);
	}
</style>
