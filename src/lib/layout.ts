export interface Design {
	width: number;
	height: number;
}

export interface Compact extends Design {
	below: number;
}

export interface Layout {
	compact: boolean;
	design: Design;
	scale: number;
}

/** Which design a host of `hostWidth` shows, and the scale that fits it. A width of 0 means not measured yet. */
export function layout(hostWidth: number, wide: Design, compact?: Compact): Layout {
	const isCompact = !!compact && hostWidth > 0 && hostWidth < compact.below;
	const design = isCompact && compact ? compact : wide;
	return { compact: isCompact, design, scale: hostWidth ? Math.min(1, hostWidth / design.width) : 1 };
}

function fit({ width, height }: Design): string {
	return `min(${height}px, ${height / width} * 100cqw)`;
}

function gate(length: string): string {
	return `max(0px, (${length}) * 100000)`;
}

/**
 * The host height as CSS, from the width of its container (`100cqw`). It equals what `layout`
 * computes, so the server render and the first paint reserve the right room, compact or wide.
 */
export function reserve(wide: Design, compact?: Compact): string {
	if (!compact) return fit(wide);
	const edge = compact.below - 0.5;
	const showWide = `min(${fit(wide)}, ${gate(`100cqw - ${edge - 0.01}px`)})`;
	const showCompact = `min(${fit(compact)}, ${gate(`${edge}px - 100cqw`)})`;
	return `max(${showWide}, ${showCompact})`;
}
