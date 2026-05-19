import React from "react";
import {
    AbsoluteFill,
    OffthreadVideo,
    staticFile,
} from "remotion";
import { GradientOverlay } from "../shared";
import { useKenBurnsZoom, getCropTransformStyle } from "../../hooks";
import type { CropRegion } from "../../lib/types";

interface CloseupLayoutProps {
    videoSrc: string;
    startFrom: number;
    zoom?: number;
    crop?: CropRegion;
}

/**
 * Yakın çekim layout'u
 * B-Roll yok, sadece ana video zoom ile
 * crop verisi varsa sanal kamera hareketi uygulanır
 */
export const CloseupLayout: React.FC<CloseupLayoutProps> = ({
    videoSrc,
    startFrom,
    zoom = 1.4,
    crop,
}) => {
    // Ken Burns micro-zoom effect
    const kenBurnsScale = useKenBurnsZoom({
        scaleStart: 1.0,
        scaleEnd: 1.05,
        durationFrames: 150,
    });

    const cropStyle = crop ? getCropTransformStyle(crop) : null;

    return (
        <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
            <OffthreadVideo
                src={staticFile(videoSrc)}
                startFrom={startFrom}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    ...(cropStyle ? {
                        // Crop-based: combine crop transform with Ken Burns micro-zoom
                        transform: `${cropStyle.transform} scale(${kenBurnsScale.toFixed(4)})`,
                        transformOrigin: cropStyle.transformOrigin,
                        objectPosition: cropStyle.objectPosition,
                    } : {
                        // Legacy fallback: fixed position + zoom
                        objectPosition: "center 80%",
                        transform: `scale(${zoom * kenBurnsScale})`,
                        transformOrigin: "center 75%",
                    }),
                }}
            />

            {/* Alt gradient - altyazılar için */}
            <GradientOverlay position="bottom" height="25%" />
        </AbsoluteFill>
    );
};

export default CloseupLayout;
