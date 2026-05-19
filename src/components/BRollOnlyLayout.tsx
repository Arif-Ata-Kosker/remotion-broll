import React from "react";
import {
    AbsoluteFill,
    OffthreadVideo,
    staticFile,
    useCurrentFrame,
    interpolate,
} from "remotion";
import { gradients } from "../lib/theme";
import { kenBurns, animationDurations } from "../lib/animation-presets";

interface BRollOnlyLayoutProps {
    brollSrc: string;
    mainVideoSrc?: string;
    mainVideoStartFrom?: number;
}

/**
 * B-Roll tam ekran layout'u
 * B-Roll görsel olarak tam ekran, A-Roll sadece ses olarak çalar
 */
export const BRollOnlyLayout: React.FC<BRollOnlyLayoutProps> = ({
    brollSrc,
    mainVideoSrc,
    mainVideoStartFrom = 0,
}) => {
    const frame = useCurrentFrame();

    // Ken Burns zoom efekti
    const scale = interpolate(
        frame,
        [0, kenBurns.brollOnly.durationFrames],
        [kenBurns.brollOnly.scaleStart, kenBurns.brollOnly.scaleEnd],
        { extrapolateRight: "clamp" }
    );

    // Fade in
    const opacity = interpolate(frame, [0, animationDurations.fadeInMedium], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
            {/* A-Roll sesi (görünmez, sadece ses) */}
            {mainVideoSrc && (
                <OffthreadVideo
                    src={staticFile(mainVideoSrc)}
                    startFrom={mainVideoStartFrom}
                    style={{ opacity: 0, position: "absolute", width: 0, height: 0 }}
                />
            )}

            {/* B-Roll görsel - tam ekran */}
            <OffthreadVideo
                src={staticFile(brollSrc)}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    opacity,
                }}
                muted
            />

            {/* Üst ve alt gradient - altyazılar için */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "15%",
                    background: gradients.topEdge,
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "25%",
                    background: gradients.bottomEdge,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};

export default BRollOnlyLayout;
