<script lang="ts">
	let {
		w = '60%',
		h = 8,
		r,
		class: className = ''
	}: { w?: string | number; h?: number; r?: number; class?: string } = $props();
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
		background: color-mix(in oklch, var(--color-fc-fg, #000) 9%, transparent);
	}
</style>
