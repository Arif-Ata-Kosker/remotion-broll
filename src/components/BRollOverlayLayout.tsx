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
import { gradients, shadows, spacing } from "../lib/theme";
import { animationDurations, animationRanges } from "../lib/animation-presets";

interface BRollOverlayLayoutProps {
    mainVideoSrc: string;
    brollSrc: string;
    brollType?: "video" | "image";
    overlayHeightRatio?: number;
    mainVideoStartFrom?: number;
}

/**
 * Ana videoyu tam ekran gösterir ve üst kısma B-Roll overlay ekler.
 * İçerik üreticisi zaten üst kısmı boş bıraktığı için,
 * B-Roll o boş alana yerleştirilir.
 */
export const BRollOverlayLayout: React.FC<BRollOverlayLayoutProps> = ({
    mainVideoSrc,
    brollSrc,
    brollType = "video",
    overlayHeightRatio = spacing.overlayHeightRatio,
    mainVideoStartFrom = 0,
}) => {
    const frame = useCurrentFrame();
    const { height } = useVideoConfig();

    const overlayHeight = height * overlayHeightRatio;

    // Entry animation - B-Roll slide in from top
    const slideProgress = interpolate(frame, [0, animationDurations.slideInBroll], [0, 1], {
        extrapolateRight: "clamp",
    });
    const slideY = interpolate(slideProgress, [0, 1], animationRanges.slideIn.yOffset);
    const fadeIn = interpolate(slideProgress, [0, 1], animationRanges.slideIn.opacity);

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Layer 1: Ana video - TAM EKRAN, kişi aşağıda görünsün */}
            <AbsoluteFill>
                <OffthreadVideo
                    src={staticFile(mainVideoSrc)}
                    startFrom={mainVideoStartFrom}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 80%",
                    }}
                />
            </AbsoluteFill>

            {/* Layer 2: B-Roll Overlay - Üst kısım (boş alana yerleşir) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: overlayHeight,
                    overflow: "hidden",
                    transform: `translateY(${slideY}px)`,
                    opacity: fadeIn,
                }}
            >
                <BRollPlayer src={brollSrc} type={brollType} />

                {/* Alt kenar gradient - yumuşak geçiş */}
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

            {/* Dekoratif çizgi - B-Roll ve ana video arası */}
            <div
                style={{
                    position: "absolute",
                    top: overlayHeight - 2,
                    left: "10%",
                    right: "10%",
                    height: 3,
                    background: gradients.decorativeLine,
                    boxShadow: shadows.decorativeLineGlow,
                    opacity: interpolate(frame, [8, 15], [0, 1], { extrapolateRight: "clamp" }),
                    borderRadius: 2,
                }}
            />
        </AbsoluteFill>
    );
};

export default BRollOverlayLayout;
