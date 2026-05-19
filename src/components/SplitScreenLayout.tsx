import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    OffthreadVideo,
    staticFile,
} from "remotion";
import { BRollPlayer } from "./BRollPlayer";
import { colors, gradients, shadows } from "../lib/theme";
import { animationDurations } from "../lib/animation-presets";

interface SplitScreenLayoutProps {
    mainVideoSrc: string;
    brollSrc: string;
    brollType?: "video" | "image";
    topRatio?: number;
    mainVideoStartFrom?: number;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
    mainVideoSrc,
    brollSrc,
    brollType = "video",
    topRatio = 0.4,
    mainVideoStartFrom = 0,
}) => {
    const frame = useCurrentFrame();
    const { height } = useVideoConfig();

    const topHeight = height * topRatio;
    const bottomHeight = height * (1 - topRatio);

    // Entry animation - slide in effect
    const slideProgress = interpolate(frame, [0, animationDurations.slideInSplit], [0, 1], {
        extrapolateRight: "clamp",
    });

    const topSlide = interpolate(slideProgress, [0, 1], [-topHeight * 0.3, 0]);
    const bottomSlide = interpolate(slideProgress, [0, 1], [bottomHeight * 0.3, 0]);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.background.dark }}>
            {/* Üst kısım: B-Roll */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: topHeight,
                    overflow: "hidden",
                    transform: `translateY(${topSlide}px)`,
                    borderBottom: `4px solid ${colors.overlay.white10}`,
                }}
            >
                <BRollPlayer src={brollSrc} type={brollType} />

                {/* B-Roll overlay gradient */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "40%",
                        background: gradients.splitBottomEdge,
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Alt kısım: Ana video (konuşmacı) */}
            <div
                style={{
                    position: "absolute",
                    top: topHeight,
                    left: 0,
                    right: 0,
                    height: bottomHeight,
                    overflow: "hidden",
                    transform: `translateY(${bottomSlide}px)`,
                }}
            >
                <OffthreadVideo
                    src={staticFile(mainVideoSrc)}
                    startFrom={mainVideoStartFrom}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center top",
                    }}
                />

                {/* Main video overlay gradient - üst kısım */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "20%",
                        background: gradients.splitTopEdge,
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Orta çizgi efekti */}
            <div
                style={{
                    position: "absolute",
                    top: topHeight - 2,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: gradients.decorativeLineStrong,
                    boxShadow: shadows.decorativeLineGlowStrong,
                    opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" }),
                }}
            />
        </AbsoluteFill>
    );
};

export default SplitScreenLayout;
