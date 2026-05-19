import React from "react";
import {
    AbsoluteFill,
    OffthreadVideo,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from "remotion";
import { colors, gradients, typography, spacing } from "../lib/theme";
import { springConfigs, pulseConfigs } from "../lib/animation-presets";

interface CTAOverlayLayoutProps {
    videoSrc: string;
    startFrom: number;
}

/**
 * CTA Overlay Layout - Segment 6
 * Üstte animasyonlu CTA, altta Burhan Bey
 */
export const CTAOverlayLayout: React.FC<CTAOverlayLayoutProps> = ({
    videoSrc,
    startFrom,
}) => {
    const frame = useCurrentFrame();
    const { fps, height } = useVideoConfig();

    const overlayHeight = height * spacing.overlayHeightRatio;

    // CTA animasyonları
    const slideIn = spring({
        frame,
        fps,
        config: springConfigs.ctaSlideIn,
    });

    const pulse = interpolate(
        frame % pulseConfigs.cta.cycleFrames,
        [0, 15, 30],
        pulseConfigs.cta.scaleRange,
    );

    const textY = interpolate(slideIn, [0, 1], [-100, 0]);
    const textOpacity = interpolate(slideIn, [0, 1], [0, 1]);

    // Video zoom - kişiyi yakınlaştır ve tavanı kes
    const videoZoom = interpolate(
        frame,
        [0, 20],
        [1.3, 1.4],
        { extrapolateRight: "clamp" }
    );

    // OTOMASYON yazısı büyüme animasyonu
    const textSize = interpolate(
        frame,
        [0, 15],
        [typography.fontSize.ctaMin, typography.fontSize.ctaMax],
        { extrapolateRight: "clamp" }
    );

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Tam ekran: Ana video - zoom + yukarı kaydırma */}
            <AbsoluteFill style={{ overflow: "hidden" }}>
                <OffthreadVideo
                    src={staticFile(videoSrc)}
                    startFrom={startFrom}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 90%",
                        transform: `scale(${videoZoom})`,
                        transformOrigin: "center 85%",
                    }}
                />
            </AbsoluteFill>

            {/* Üst kısım: Transparan CTA Overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: overlayHeight,
                    background: gradients.ctaOverlay,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "20px",
                    transform: `translateY(${textY}px)`,
                    opacity: textOpacity,
                }}
            >
                {/* Tek kelime: OTOMASYON */}
                <div
                    style={{
                        fontSize: textSize,
                        fontWeight: typography.fontWeight.black,
                        color: colors.accent.gold,
                        textAlign: "center",
                        textShadow: `0 4px 30px ${colors.glow.gold60}, 0 2px 10px ${colors.overlay.black85}`,
                        transform: `scale(${pulse})`,
                        letterSpacing: typography.letterSpacing.extraWide,
                        textTransform: "uppercase",
                    }}
                >
                    OTOMASYON
                </div>
            </div>
        </AbsoluteFill>
    );
};

export default CTAOverlayLayout;
