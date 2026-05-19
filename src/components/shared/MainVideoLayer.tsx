import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import type { CropRegion } from "../../lib/types";
import { getCropTransformStyle } from "../../hooks";

interface MainVideoLayerProps {
	videoSrc: string;
	startFrom?: number;
	objectPosition?: string;
	zoom?: number;
	zoomOrigin?: string;
	opacity?: number;
	style?: React.CSSProperties;
	crop?: CropRegion;
}

/**
 * Ana video katmanı wrapper bileşeni.
 * Layout komponentlerinde tekrarlanan OffthreadVideo setup'ını tek noktada toplar.
 * crop verisi varsa sanal kamera hareketi uygular.
 */
export const MainVideoLayer: React.FC<MainVideoLayerProps> = ({
	videoSrc,
	startFrom = 0,
	objectPosition = "center 80%",
	zoom,
	zoomOrigin = "center center",
	opacity,
	style,
	crop,
}) => {
	const cropStyle = crop ? getCropTransformStyle(crop) : null;

	return (
		<AbsoluteFill style={{ overflow: "hidden" }}>
			<OffthreadVideo
				src={staticFile(videoSrc)}
				startFrom={startFrom}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
					...(cropStyle ? {
						transform: cropStyle.transform,
						transformOrigin: cropStyle.transformOrigin,
						objectPosition: cropStyle.objectPosition,
					} : {
						objectPosition,
						...(zoom != null && {
							transform: `scale(${zoom})`,
							transformOrigin: zoomOrigin,
						}),
					}),
					...(opacity != null && { opacity }),
					...style,
				}}
			/>
		</AbsoluteFill>
	);
};
