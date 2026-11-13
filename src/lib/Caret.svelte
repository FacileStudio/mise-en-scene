<script lang="ts"></script>

<!--
@component
A blinking block caret, one character cell wide, for terminals and typed fields.
-->

<span class="mes-caret" aria-hidden="true"></span>

<style>
	.mes-caret {
		display: inline-block;
		width: 1ch;
		height: 1.1em;
		margin-left: 1px;
		vertical-align: -0.2em;
		background: currentColor;
		opacity: 0.75;
		animation: mes-blink 1.1s steps(1) infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.mes-caret {
			animation: none;
		}
	}
	@keyframes mes-blink {
		50% {
			opacity: 0;
		}
	}
</style>