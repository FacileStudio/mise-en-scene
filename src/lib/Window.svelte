<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface WindowProps {
		/** Centered in the title bar. Leave it out when the page around the demo already names the product. */
		title?: string;
		/** A left column that runs the full height of the window. */
		sidebar?: Snippet;
		/** The title bar's right side: a status, a share button. */
		trailing?: Snippet;
		class?: string;
		style?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	let { title, sidebar, trailing, class: className = '', style, children }: WindowProps = $props();
</script>

<!--
@component
A desktop app window: a 38px title bar, an optional full-height sidebar and the body. Its depth comes
from shadow and surface steps, never a border: in dark mode the body steps up to `fc-component` and the
chrome to `fc-surface`, so the window stands off a dark page. Position and size it from the scene with `class` or
`style`; keep it whole inside the stage, four corners rounded and the shadow uncut, never squashed.
-->

<div class="mes-window {className}" {style}>
	<div class="mes-titlebar mes-side">
		<span class="mes-dot"></span>
		<span class="mes-dot"></span>
		<span class="mes-dot"></span>
		{#if title}<span class="mes-title">{title}</span>{/if}
		{#if trailing}<span class="mes-trailing">{@render trailing()}</span>{/if}
	</div>
	<div class="mes-frame">
		{#if sidebar}<aside class="mes-sidebar mes-side">{@render sidebar()}</aside>{/if}
		<div class="mes-body">{@render children()}</div>
	</div>
</div>

<style>
	.mes-window {
		--mes-w-body: var(--color-fc-page);
		--mes-w-side: var(--color-fc-component);
		position: absolute;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 12px;
		background: var(--mes-w-body);
		color: var(--color-fc-fg);
		box-shadow: var(--mes-shadow-hero, 0 30px 70px -20px rgb(0 0 0 / 0.22), 0 8px 24px -8px rgb(0 0 0 / 0.1));
	}
	@media (prefers-color-scheme: dark) {
		:global(:root:not(.light)) .mes-window {
			--mes-w-body: var(--color-fc-component);
			--mes-w-side: var(--color-fc-surface);
		}
	}
	:global(:root.dark) .mes-window {
		--mes-w-body: var(--color-fc-component);
		--mes-w-side: var(--color-fc-surface);
	}
	.mes-side {
		background: var(--mes-w-side);
	}
	.mes-titlebar {
		position: relative;
		display: flex;
		flex: none;
		align-items: center;
		gap: 8px;
		height: 38px;
		padding: 0 14px;
	}
	.mes-dot {
		width: 12px;
		height: 12px;
		border-radius: 999px;
		background: var(--color-fc-field);
	}
	.mes-title {
		position: absolute;
		left: 50%;
		translate: -50% 0;
		font-size: 12px;
		color: var(--color-fc-fg-muted);
	}
	.mes-trailing {
		display: flex;
		align-items: center;
		margin-left: auto;
	}
	.mes-frame {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.mes-sidebar {
		display: flex;
		flex: none;
		flex-direction: column;
		width: 208px;
	}
	.mes-body {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
</style>
