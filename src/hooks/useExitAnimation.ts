import { interpolate, useCurrentFrame } from "remotion";

interface ExitAnimationOptions {
	durationFrames: number;
	fadeOutFrames?: number;
}

export function useExitAnimation(options: ExitAnimationOptions) {
	const frame = useCurrentFrame();
	const { fadeOutFrames = 10 } = options;

	const exitProgress = interpolate(
		frame,
		[options.durationFrames - fadeOutFrames, options.durationFrames],
		[1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	return { exitProgress };
}
