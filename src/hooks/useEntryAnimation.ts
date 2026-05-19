import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface EntryAnimationOptions {
	config: Record<string, number>;
	durationInFrames: number;
	scaleRange: readonly [number, number];
	yOffsetRange: readonly [number, number];
}

export function useEntryAnimation(options: EntryAnimationOptions) {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const enterSpring = spring({
		frame,
		fps,
		config: options.config,
		durationInFrames: options.durationInFrames,
	});

	const scaleValue = interpolate(enterSpring, [0, 1], options.scaleRange as [number, number]);
	const yOffset = interpolate(enterSpring, [0, 1], options.yOffsetRange as [number, number]);
	const opacity = interpolate(enterSpring, [0, 1], [0, 1]);

	return { scaleValue, yOffset, opacity, enterSpring };
}
