import { describe, expect, it } from 'bun:test';
import { createAct, cursorAt, loop, measure, sleep } from './act';

function box(left: number, top: number, width: number, height: number) {
	return { getBoundingClientRect: () => ({ left, top, width, height }) } as unknown as Element;
}

describe('act', () => {
	it('stops the loop when the signal aborts mid-run', async () => {
		const controller = new AbortController();
		let runs = 0;
		await loop(async () => {
			runs++;
			if (runs === 2) controller.abort();
			await sleep(20, controller.signal);
		}, controller.signal);
		expect(runs).toBe(2);
	});

	it('plays a script that never waits once instead of spinning', async () => {
		let runs = 0;
		await loop(async () => {
			runs++;
		}, new AbortController().signal);
		expect(runs).toBe(1);
	});

	it('types one character per step and counts up to the total', async () => {
		const act = createAct(new AbortController().signal, () => undefined, () => 1);
		const typed: string[] = [];
		const counted: number[] = [];
		await act.type('abc', (v) => typed.push(v), 0);
		await act.count(3, (v) => counted.push(v), 0);
		expect(typed).toEqual(['a', 'ab', 'abc']);
		expect(counted).toEqual([1, 2, 3]);
	});

	it('measures a target in unscaled design pixels', () => {
		const point = measure(box(100, 50, 480, 290), box(300, 150, 40, 20), 0.5, 0.5, 0.5);
		expect(point).toEqual({ x: 440, y: 220 });
	});

	it('presses and releases the cursor around the press callback', async () => {
		const act = createAct(new AbortController().signal, () => undefined, () => 1);
		const cursor = cursorAt();
		let downDuringPress = false;
		await act.click(cursor, () => (downDuringPress = cursor.down));
		expect(downDuringPress).toBe(true);
		expect(cursor.down).toBe(false);
	});
});
