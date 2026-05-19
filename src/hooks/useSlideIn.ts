import { interpolate, useCurrentFrame } from "remotion";

interface SlideInOptions {
	durationFrames: number;
	yOffsetRange?: readonly [number, number];
}

export function useSlideIn(options: SlideInOptions) {
	const frame = useCurrentFrame();
	const { yOffsetRange = [-50, 0] } = options;

	const progress = interpolate(frame, [0, options.durationFrames], [0, 1], {
		extrapolateRight: "clamp",
	});

	const slideY = interpolate(progress, [0, 1], yOffsetRange as [number, number]);
	const opacity = interpolate(progress, [0, 1], [0, 1]);

	return { slideY, opacity, progress };
}
