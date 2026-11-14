<svelte:options css="injected" />

<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface TerminalProps {
		class?: string;
		/** Position and size inside the stage, in design pixels. */
		style?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	let { class: className = '', style, children }: TerminalProps = $props();
</script>

<!--
@component
A dark terminal panel on muse's inverse surface (`fc-inverse`, `fc-on-inverse`). Its identity is the
dark ground, so it stays dark in both themes, with depth from shadow. Lines are monospace on a character grid; use `Caret` for the cursor cell.
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
		background: var(--color-fc-inverse);
		color: var(--color-fc-on-inverse);
		font-family: var(--font-fc-mono);
		font-size: 12px;
		line-height: 20px;
		box-shadow: 0 18px 40px -16px rgb(0 0 0 / 0.35);
	}
</style>
