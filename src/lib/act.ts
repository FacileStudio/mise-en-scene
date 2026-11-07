export interface Point {
	x: number;
	y: number;
}

export interface CursorState extends Point {
	visible: boolean;
	down: boolean;
}

/** The handle a scene script gets: timing, typing, measuring and the cursor, all tied to one run. */
export interface Act {
	readonly signal: AbortSignal;
	wait(ms: number): Promise<void>;
	type(text: string, set: (value: string) => void, interval?: number): Promise<void>;
	count(total: number, set: (value: number) => void, interval?: number): Promise<void>;
	point(target: Element | undefined, fx?: number, fy?: number): Point;
	move(cursor: CursorState, to: Point, settle?: number): Promise<void>;
	click(cursor: CursorState, onPress?: () => void): Promise<void>;
}

export type Script = (act: Act) => Promise<void>;

/** Resolves after `ms`, or rejects as soon as `signal` aborts. */
export function sleep(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal.aborted) return reject(signal.reason);
		const stop = () => {
			clearTimeout(id);
			reject(signal.reason);
		};
		const id = setTimeout(() => {
			signal.removeEventListener('abort', stop);
			resolve();
		}, ms);
		signal.addEventListener('abort', stop, { once: true });
	});
}

/**
 * Runs `run` back to back until `signal` aborts; the abort itself is not an error. A run that
 * finishes within one frame never waited, so it plays once: looping it would spin the event loop.
 */
export async function loop(run: () => Promise<void>, signal: AbortSignal): Promise<void> {
	while (!signal.aborted) {
		const start = Date.now();
		try {
			await run();
		} catch (error) {
			if (!signal.aborted) throw error;
		}
		if (Date.now() - start < 16) return;
	}
}

/** True when the visitor asked the OS for reduced motion. */
export function prefersReducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A cursor at rest and hidden; keep it in `$state` so the scene reacts to moves. */
export function cursorAt(x = 0, y = 0): CursorState {
	return { x, y, visible: false, down: false };
}

/**
 * Builds the `Act` for one run. `stage` and `scale` let `point` turn a rendered element into
 * design coordinates, so a script never hard-codes where a control sits.
 */
export function createAct(signal: AbortSignal, stage: () => Element | undefined, scale: () => number): Act {
	const wait = (ms: number) => sleep(ms, signal);
	return {
		signal,
		wait,
		async type(text, set, interval = 38) {
			for (let i = 1; i <= text.length; i++) {
				set(text.slice(0, i));
				await wait(interval);
			}
		},
		async count(total, set, interval = 45) {
			for (let i = 1; i <= total; i++) {
				set(i);
				await wait(interval);
			}
		},
		point: (target, fx = 0.5, fy = 0.5) => measure(stage(), target, scale(), fx, fy),
		async move(cursor, to, settle = 950) {
			cursor.x = to.x;
			cursor.y = to.y;
			await wait(settle);
		},
		async click(cursor, onPress) {
			cursor.down = true;
			onPress?.();
			await wait(140);
			cursor.down = false;
			await wait(160);
		}
	};
}

/** The point at fractions `fx`, `fy` of `target`, in the stage's unscaled design pixels. */
export function measure(stage: Element | undefined, target: Element | undefined, scale: number, fx = 0.5, fy = 0.5) {
	if (!stage || !target) return { x: 0, y: 0 };
	const s = stage.getBoundingClientRect();
	const t = target.getBoundingClientRect();
	return { x: (t.left - s.left + t.width * fx) / scale, y: (t.top - s.top + t.height * fy) / scale };
}
