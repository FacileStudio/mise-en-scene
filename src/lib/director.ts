import { loop } from './act.js';

/** What decides whether a scene plays: on screen, tab in front, motion allowed. */
export interface Cue {
	onScreen: boolean;
	hidden: boolean;
	reduced: boolean;
}

export interface DirectorOptions {
	run: (signal: AbortSignal) => Promise<void>;
	reset?: () => void;
	poster?: () => void;
}

export interface Director {
	update(next: Partial<Cue>): void;
	halt(): void;
}

/**
 * Plays `run` in a loop exactly while the stage is on screen, the tab is visible and motion is
 * allowed. Each start puts the scene back on its opening frame. A stop resets it, or shows the
 * poster when the visitor asked for reduced motion.
 */
export function director({ run, reset, poster }: DirectorOptions): Director {
	const cue: Cue = { onScreen: false, hidden: false, reduced: false };
	let controller: AbortController | null = null;

	function halt() {
		controller?.abort();
		controller = null;
	}

	function start() {
		const current = new AbortController();
		controller = current;
		reset?.();
		void loop(() => run(current.signal), current.signal);
	}

	return {
		update(next) {
			const wasReduced = cue.reduced;
			Object.assign(cue, next);
			if (cue.onScreen && !cue.hidden && !cue.reduced) {
				if (!controller) start();
				return;
			}
			const playing = controller !== null;
			halt();
			if (cue.reduced && !wasReduced) poster?.();
			else if (playing) reset?.();
		},
		halt
	};
}

/** True when an observer entry shows at least `threshold` of the stage, with slack for rounding. */
export function inView(entry: Pick<IntersectionObserverEntry, 'isIntersecting' | 'intersectionRatio'>, threshold: number) {
	return entry.isIntersecting && entry.intersectionRatio >= threshold - 0.01;
}
