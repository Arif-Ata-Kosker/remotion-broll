import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { gradients, shadows } from "../../lib/theme";

interface DecorativeLineProps {
	topOffset: number | string;
	fadeInRange?: [number, number];
	fullWidth?: boolean;
	variant?: "normal" | "strong";
}

/**
 * Dekoratif altın çizgi bileşeni.
 * BRollOverlayLayout, ZoomOverlayLayout ve SplitScreenLayout'ta tekrarlanan
 * altın gradient çizgiyi tek bileşende toplar.
 */
export const DecorativeLine: React.FC<DecorativeLineProps> = ({
	topOffset,
	fadeInRange = [8, 15],
	fullWidth = false,
	variant = "normal",
}) => {
	const frame = useCurrentFrame();

	const isStrong = variant === "strong";

	return (
		<div
			style={{
				position: "absolute",
				top: topOffset,
				left: fullWidth ? 0 : "10%",
				right: fullWidth ? 0 : "10%",
				height: isStrong ? 4 : 3,
				background: isStrong ? gradients.decorativeLineStrong : gradients.decorativeLine,
				boxShadow: isStrong ? shadows.decorativeLineGlowStrong : shadows.decorativeLineGlow,
				opacity: interpolate(frame, fadeInRange, [0, 1], { extrapolateRight: "clamp" }),
				borderRadius: isStrong ? 0 : 2,
			}}
		/>
	);
};
