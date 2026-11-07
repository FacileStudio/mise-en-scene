<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		style,
		children
	}: { class?: string; style?: string; children: Snippet } = $props();
</script>

<!--
@component
A dark terminal panel. Its identity is the dark ground, so it stays dark in both themes, with depth
from shadow. Lines are monospace on a character grid; use `Caret` for the cursor cell.
-->

<div class="mes-terminal {className}" {style}>
	{@render children()}
</div>

<style>
	.mes-terminal {
		position: absolute;
		overflow: hidden;
		padding: 12px 16px;
		border-radius: 12px;
		background: oklch(0.18 0 0);
		color: rgb(255 255 255 / 0.9);
		font-family: var(--font-fc-mono, ui-monospace, monospace);
		font-size: 12px;
		line-height: 20px;
		box-shadow: 0 18px 40px -16px rgb(0 0 0 / 0.35);
	}
</style>
