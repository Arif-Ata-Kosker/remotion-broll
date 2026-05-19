import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    OffthreadVideo,
    staticFile,
    Img,
} from "remotion";
import { kenBurns } from "../lib/animation-presets";

interface BRollPlayerProps {
    src: string;
    type?: "video" | "image";
    fadeIn?: boolean;
    fadeOut?: boolean;
    fadeDurationFrames?: number;
    loop?: boolean;
}

export const BRollPlayer: React.FC<BRollPlayerProps> = ({
    src,
    type = "video",
    fadeIn = true,
    fadeOut = true,
    fadeDurationFrames = 10,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Critical: If asset failed to generate, do not render B-Roll.
    // This allows the A-Roll (Main Video) to shine through or prevents crash.
    if (src.startsWith("GEN_AI_FAILED") || src.startsWith("STOCK_NOT_FOUND") || src.startsWith("MISSING")) {
        return null;
    }

    // Fade in/out opacity
    let opacity = 1;

    if (fadeIn) {
        opacity = interpolate(frame, [0, fadeDurationFrames], [0, 1], {
            extrapolateRight: "clamp",
        });
    }

    if (fadeOut) {
        const fadeOutStart = durationInFrames - fadeDurationFrames;
        opacity = Math.min(
            opacity,
            interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], {
                extrapolateLeft: "clamp",
            })
        );
    }

    // Ken Burns effect - subtle zoom
    const scale = interpolate(frame, [0, durationInFrames], [kenBurns.brollPlayer.scaleStart, kenBurns.brollPlayer.scaleEnd], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                overflow: "hidden",
                opacity,
            }}
        >
            {type === "video" ? (
                <OffthreadVideo
                    src={staticFile(src)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 20%",
                        transform: `scale(${scale})`,
                        transformOrigin: "center 20%",
                    }}
                    muted
                />
            ) : (
                <Img
                    src={staticFile(src)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 20%",
                        transform: `scale(${scale})`,
                        transformOrigin: "center 20%",
                    }}
                />
            )}
        </AbsoluteFill>
    );
};

export default BRollPlayer;
