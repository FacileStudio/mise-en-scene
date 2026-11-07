<script lang="ts">
	import { fly } from 'svelte/transition';

	let { value, class: className = '' }: { value: string; class?: string } = $props();
</script>

<!--
@component
A word that changes by rolling: the old value leaves upward as the new one rises into the same cell.
Both share one grid cell, so the slot never resizes mid-roll. Give the host a fixed width.
-->

<span class="mes-roll {className}">
	{#key value}
		<span in:fly={{ y: 14, duration: 380, opacity: 0 }} out:fly={{ y: -14, duration: 380, opacity: 0 }}>
			{value}
		</span>
	{/key}
</span>

<style>
	.mes-roll {
		display: inline-grid;
		overflow: hidden;
	}
	.mes-roll > span {
		grid-area: 1 / 1;
	}
</style>
