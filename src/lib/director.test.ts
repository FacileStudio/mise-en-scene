import { describe, expect, it } from 'bun:test';
import { director, inView } from './director';
import { grow } from './transitions';

function cast() {
	const log: string[] = [];
	let runs = 0;
	let aborted = 0;
	const d = director({
		run: (signal) =>
			new Promise<void>((_, reject) => {
				runs++;
				signal.addEventListener('abort', () => {
					aborted++;
					reject(signal.reason);
				});
			}),
		reset: () => log.push('reset'),
		poster: () => log.push('poster')
	});
	return { d, log, runs: () => runs, aborted: () => aborted };
}

describe('director', () => {
	it('plays only while on screen with the tab in front', () => {
		const c = cast();
		c.d.update({ onScreen: true });
		expect(c.runs()).toBe(1);
		c.d.update({ hidden: true });
		expect(c.aborted()).toBe(1);
		c.d.update({ hidden: false });
		expect(c.runs()).toBe(2);
		c.d.update({ onScreen: false });
		expect(c.aborted()).toBe(2);
		expect(c.log).toEqual(['reset', 'reset', 'reset', 'reset']);
	});

	it('shows the poster under reduced motion and never runs', () => {
		const c = cast();
		c.d.update({ reduced: true, hidden: false });
		c.d.update({ onScreen: true });
		expect(c.runs()).toBe(0);
		expect(c.log).toEqual(['poster']);
	});

	it('swaps to the poster when reduced motion turns on mid-run', () => {
		const c = cast();
		c.d.update({ onScreen: true });
		c.d.update({ reduced: true });
		expect(c.aborted()).toBe(1);
		expect(c.log).toEqual(['reset', 'poster']);
	});

	it('stops a running loop on halt', () => {
		const c = cast();
		c.d.update({ onScreen: true });
		c.d.halt();
		expect(c.aborted()).toBe(1);
	});

	it('counts a stage as on screen only past the threshold', () => {
		expect(inView({ isIntersecting: true, intersectionRatio: 0.2 }, 0.35)).toBe(false);
		expect(inView({ isIntersecting: true, intersectionRatio: 0.345 }, 0.35)).toBe(true);
		expect(inView({ isIntersecting: false, intersectionRatio: 0 }, 0)).toBe(false);
	});
});

describe('grow', () => {
	it('grows to the layout height, not the scaled on-screen height', () => {
		const node = { offsetHeight: 40, getBoundingClientRect: () => ({ height: 20 }) } as unknown as Element;
		expect(grow(node).css?.(1, 0)).toContain('height: 40px');
	});
});
