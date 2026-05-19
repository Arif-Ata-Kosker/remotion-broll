import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { colors, gradients, typography, spacing, shadows } from "../lib/theme";
import { springConfigs, animationDurations, animationRanges } from "../lib/animation-presets";
import { useEntryAnimation, useExitAnimation } from "../hooks";

const { fontFamily } = loadFont();

interface HookIntroProps {
    text: string;
    subtext?: string;
    durationMs: number;
}

export const HookIntro: React.FC<HookIntroProps> = ({
    text,
    subtext,
    durationMs,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const durationFrames = (durationMs / 1000) * fps;

    // Entry animation using custom hook
    const { scaleValue, yOffset, enterSpring } = useEntryAnimation({
        config: springConfigs.hookEntry,
        durationInFrames: animationDurations.hookEntry,
        scaleRange: animationRanges.hookEntry.scale,
        yOffsetRange: animationRanges.hookEntry.yOffset,
    });

    // Exit animation using custom hook
    const { exitProgress } = useExitAnimation({
        durationFrames,
        fadeOutFrames: animationDurations.hookExitFrames,
    });

    // Subtext delay
    const subtextSpring = spring({
        frame: frame - animationDurations.hookSubtextDelay,
        fps,
        config: springConfigs.hookSubtext,
        durationInFrames: animationDurations.hookSubtext,
    });

    const subtextScale = interpolate(subtextSpring, [0, 1], animationRanges.hookSubtext.scale);
    const subtextOpacity = interpolate(subtextSpring, [0, 1], [0, 1]);

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                background: gradients.hookIntroBg,
                opacity: exitProgress,
            }}
        >
            {/* Animated background circles */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${colors.glow.orange30} 0%, transparent 70%)`,
                    transform: `scale(${enterSpring * 1.5})`,
                    opacity: 0.6,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${colors.glow.gold40} 0%, transparent 70%)`,
                    transform: `scale(${enterSpring * 1.2})`,
                    opacity: 0.5,
                }}
            />

            {/* Main hook text */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: spacing.gap.medium,
                    zIndex: 10,
                    transform: makeTransform([scale(scaleValue), translateY(yOffset)]),
                }}
            >
                <div
                    style={{
                        fontSize: typography.fontSize.hookTitle,
                        fontFamily,
                        fontWeight: typography.fontWeight.black,
                        color: colors.accent.gold,
                        textAlign: "center",
                        textTransform: "uppercase",
                        letterSpacing: typography.letterSpacing.wide,
                        textShadow: shadows.hookTitleGlow,
                        padding: "20px 40px",
                        background: colors.overlay.white10,
                        backdropFilter: "blur(10px)",
                        borderRadius: spacing.borderRadius.medium,
                        border: `2px solid ${colors.glow.gold50}`,
                    }}
                >
                    {text}
                </div>

                {subtext && (
                    <div
                        style={{
                            fontSize: typography.fontSize.hookSubtext,
                            fontFamily,
                            fontWeight: typography.fontWeight.semiBold,
                            color: colors.text.primary,
                            textAlign: "center",
                            opacity: subtextOpacity,
                            transform: `scale(${subtextScale})`,
                            textShadow: shadows.textMedium,
                            maxWidth: "80%",
                        }}
                    >
                        {subtext}
                    </div>
                )}
            </div>

            {/* Decorative elements */}
            <div
                style={{
                    position: "absolute",
                    bottom: 200,
                    display: "flex",
                    gap: spacing.gap.small,
                    opacity: subtextOpacity,
                }}
            >
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: i === 1 ? colors.accent.gold : colors.overlay.white50,
                            transform: `scale(${subtextSpring})`,
                        }}
                    />
                ))}
            </div>
        </AbsoluteFill>
    );
};

export default HookIntro;
