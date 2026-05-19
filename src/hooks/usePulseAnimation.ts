import { interpolate, useCurrentFrame } from "remotion";

interface SinPulseOptions {
	speed: number;
	scaleRange: readonly [number, number];
}

interface CyclePulseOptions {
	cycleFrames: number;
	scaleRange: readonly [number, number, number];
}

export function useSinPulse(options: SinPulseOptions) {
	const frame = useCurrentFrame();

	const pulse = interpolate(
		Math.sin(frame * options.speed),
		[-1, 1],
		options.scaleRange as [number, number]
	);

	return pulse;
}

export function useCyclePulse(options: CyclePulseOptions) {
	const frame = useCurrentFrame();

	const pulse = interpolate(
		frame % options.cycleFrames,
		[0, options.cycleFrames / 2, options.cycleFrames],
		options.scaleRange as [number, number, number]
	);

	return pulse;
}

export function useBounce(speed: number, amplitude: number) {
	const frame = useCurrentFrame();
	return Math.sin(frame * speed) * amplitude;
}
