import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { colors, gradients, typography, spacing, shadows } from "../lib/theme";
import { springConfigs, animationDurations, animationRanges, pulseConfigs } from "../lib/animation-presets";
import { useEntryAnimation, useSinPulse, useBounce } from "../hooks";

const { fontFamily } = loadFont();

interface EndCardProps {
    title: string;
    subtitle?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
    title,
    subtitle,
}) => {
    const frame = useCurrentFrame();

    // Entry animation using custom hook
    const { scaleValue, yOffset, opacity } = useEntryAnimation({
        config: springConfigs.endCardEntry,
        durationInFrames: animationDurations.endCardEntry,
        scaleRange: animationRanges.endCardEntry.scale,
        yOffsetRange: animationRanges.endCardEntry.yOffset,
    });

    // Arrow bounce animation using custom hook
    const arrowBounce = useBounce(
        pulseConfigs.endCardArrow.speed,
        pulseConfigs.endCardArrow.amplitude,
    );

    // Pulse effect for CTA using custom hook
    const pulse = useSinPulse({
        speed: pulseConfigs.endCard.speed,
        scaleRange: pulseConfigs.endCard.scaleRange,
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                background: gradients.endCardBg,
                opacity,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: spacing.gap.large,
                    transform: makeTransform([scale(scaleValue), translateY(yOffset)]),
                }}
            >
                {/* Main CTA Box */}
                <div
                    style={{
                        background: gradients.endCardCta,
                        padding: "30px 50px",
                        borderRadius: spacing.borderRadius.large,
                        boxShadow: shadows.endCardCtaBox,
                        transform: `scale(${pulse})`,
                    }}
                >
                    <div
                        style={{
                            fontSize: typography.fontSize.endCardTitle,
                            fontFamily,
                            fontWeight: typography.fontWeight.black,
                            color: colors.text.primary,
                            textAlign: "center",
                            textTransform: "uppercase",
                            letterSpacing: typography.letterSpacing.medium,
                            textShadow: shadows.textSoft,
                        }}
                    >
                        {title}
                    </div>
                </div>

                {/* Subtitle */}
                {subtitle && (
                    <div
                        style={{
                            fontSize: typography.fontSize.endCardSubtitle,
                            fontFamily,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.overlay.white90,
                            textAlign: "center",
                            maxWidth: "85%",
                            lineHeight: 1.4,
                        }}
                    >
                        {subtitle}
                    </div>
                )}

                {/* Animated Arrow */}
                <div
                    style={{
                        fontSize: typography.fontSize.endCardArrow,
                        transform: `translateY(${arrowBounce}px)`,
                        filter: `drop-shadow(${shadows.textSubtle})`,
                    }}
                >
                    👇
                </div>

                {/* Action hints */}
                <div
                    style={{
                        display: "flex",
                        gap: spacing.gap.medium,
                        marginTop: 20,
                    }}
                >
                    {["❤️ Beğen", "💬 Yorum", "📤 Paylaş"].map((action, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: typography.fontSize.endCardAction,
                                fontFamily,
                                fontWeight: typography.fontWeight.semiBold,
                                color: colors.overlay.white80,
                                background: colors.overlay.white10,
                                padding: "12px 24px",
                                borderRadius: spacing.borderRadius.pill,
                                backdropFilter: "blur(10px)",
                                border: `1px solid ${colors.overlay.white20}`,
                                transform: `translateY(${Math.sin((frame + i * 10) * 0.2) * 5}px)`,
                            }}
                        >
                            {action}
                        </div>
                    ))}
                </div>
            </div>
        </AbsoluteFill>
    );
};

export default EndCard;
