import React from "react";

interface GradientOverlayProps {
	position: "top" | "bottom";
	height?: string;
	gradient?: string;
}

/**
 * Yeniden kullanılabilir gradient overlay bileşeni.
 * Layout komponentlerinde tekrarlanan alt/üst kenar gradientlerini tek noktada toplar.
 */
export const GradientOverlay: React.FC<GradientOverlayProps> = ({
	position,
	height = "35%",
	gradient,
}) => {
	const defaultGradient = position === "bottom"
		? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)"
		: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)";

	return (
		<div
			style={{
				position: "absolute",
				[position]: 0,
				left: 0,
				right: 0,
				height,
				background: gradient ?? defaultGradient,
				pointerEvents: "none",
			}}
		/>
	);
};
