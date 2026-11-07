import { cubicOut } from 'svelte/easing';

export interface GrowOptions {
	delay?: number;
	duration?: number;
}

/**
 * Height and opacity together: the room opens first and the content fades in as it lands, so a
 * new row carries the rows below it instead of popping. Put spacing inside the element (padding),
 * not in the parent's `gap`, or the gap jumps when the element unmounts.
 */
export function grow(node: Element, { delay = 0, duration = 450 }: GrowOptions = {}) {
	const height = node.getBoundingClientRect().height;
	return {
		delay,
		duration,
		easing: cubicOut,
		css: (t: number) => `overflow: hidden; height: ${t * height}px; opacity: ${Math.max(0, (t - 0.4) / 0.6)};`
	};
}

/** The travel curve for anything that moves across the stage: soft departure, long arrival. */
export const TRAVEL = 'cubic-bezier(0.45, 0, 0.1, 1)';

/** The arrival curve for something that appears from nowhere, over 0.8 to 1s. */
export const ARRIVE = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
