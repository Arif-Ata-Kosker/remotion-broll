import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface KenBurnsOptions {
	scaleStart: number;
	scaleEnd: number;
	durationFrames?: number;
}

export function useKenBurnsZoom(options: KenBurnsOptions) {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const duration = options.durationFrames ?? durationInFrames;

	const scale = interpolate(
		frame,
		[0, duration],
		[options.scaleStart, options.scaleEnd],
		{ extrapolateRight: "clamp" }
	);

	return scale;
}
