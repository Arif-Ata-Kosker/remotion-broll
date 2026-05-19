import React from "react";
import {
    AbsoluteFill,
    OffthreadVideo,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from "remotion";
import { BRollPlayer } from "./BRollPlayer";
import { gradients, shadows, spacing } from "../lib/theme";
import { animationDurations, animationRanges } from "../lib/animation-presets";

interface ZoomOverlayLayoutProps {
    mainVideoSrc: string;
    brollSrc: string;
    brollType?: "video" | "image";
    mainVideoStartFrom?: number;
    zoomDurationMs?: number;
}

/**
 * Zoom + B-Roll Overlay Layout - Segment 1
 * Ana video 0'dan başlayıp 2 saniyede normal boyuta geliyor
 * Üstte B-Roll overlay
 */
export const ZoomOverlayLayout: React.FC<ZoomOverlayLayoutProps> = ({
    mainVideoSrc,
    brollSrc,
    brollType = "video",
    mainVideoStartFrom = 0,
    zoomDurationMs = 2000,
}) => {
    const frame = useCurrentFrame();
    const { fps, height } = useVideoConfig();

    const overlayHeight = height * spacing.overlayHeightRatio;
    const zoomDurationFrames = Math.floor((zoomDurationMs / 1000) * fps);

    // Hızlı zoom animasyonu: 0 -> 1 (2 saniyede)
    const zoomScale = interpolate(
        frame,
        [0, zoomDurationFrames],
        [0.3, 1],
        { extrapolateRight: "clamp" }
    );

    // Opacity fade in
    const videoOpacity = interpolate(
        frame,
        [0, animationDurations.fadeInQuick],
        [0, 1],
        { extrapolateRight: "clamp" }
    );

    // B-Roll slide in animasyonu
    const slideY = interpolate(
        frame,
        [0, animationDurations.slideInZoom],
        animationRanges.slideIn.yOffset,
        { extrapolateRight: "clamp" }
    );

    const brollOpacity = interpolate(
        frame,
        [0, animationDurations.slideInZoom],
        animationRanges.slideIn.opacity,
        { extrapolateRight: "clamp" }
    );

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Ana video - Zoom animasyonu ile */}
            <AbsoluteFill style={{ overflow: "hidden" }}>
                <OffthreadVideo
                    src={staticFile(mainVideoSrc)}
                    startFrom={mainVideoStartFrom}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${zoomScale})`,
                        transformOrigin: "center center",
                        opacity: videoOpacity,
                    }}
                />
            </AbsoluteFill>

            {/* B-Roll Overlay - Üst kısım */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: overlayHeight,
                    overflow: "hidden",
                    transform: `translateY(${slideY}px)`,
                    opacity: brollOpacity,
                }}
            >
                <BRollPlayer src={brollSrc} type={brollType} />

                {/* Gradient overlay */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "35%",
                        background: gradients.bottomEdge,
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Dekoratif çizgi */}
            <div
                style={{
                    position: "absolute",
                    top: overlayHeight - 2,
                    left: "10%",
                    right: "10%",
                    height: 3,
                    background: gradients.decorativeLine,
                    boxShadow: shadows.decorativeLineGlow,
                    opacity: interpolate(frame, [10, 20], [0, 1], { extrapolateRight: "clamp" }),
                    borderRadius: 2,
                }}
            />
        </AbsoluteFill>
    );
};

export default ZoomOverlayLayout;
