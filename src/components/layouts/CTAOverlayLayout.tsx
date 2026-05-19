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
import { colors, gradients, typography, spacing } from "../../lib/theme";
import { springConfigs, pulseConfigs } from "../../lib/animation-presets";
import { getCropTransformStyle } from "../../hooks";
import type { CropRegion } from "../../lib/types";

interface CTAOverlayLayoutProps {
    videoSrc: string;
    startFrom: number;
    crop?: CropRegion;
}

/**
 * CTA Overlay Layout
 * Ustte animasyonlu CTA, altta kisi
 * crop verisi varsa sanal kamera hareketi uygulanir
 */
export const CTAOverlayLayout: React.FC<CTAOverlayLayoutProps> = ({
    videoSrc,
    startFrom,
    crop,
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

    // Video micro-zoom animation
    const videoZoom = interpolate(
        frame,
        [0, 20],
        [1.0, 1.05],
        { extrapolateRight: "clamp" }
    );

    // OTOMASYON yazısı büyüme animasyonu
    const textSize = interpolate(
        frame,
        [0, 15],
        [typography.fontSize.ctaMin, typography.fontSize.ctaMax],
        { extrapolateRight: "clamp" }
    );

    const cropStyle = crop ? getCropTransformStyle(crop) : null;

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Tam ekran: Ana video - zoom + crop */}
            <AbsoluteFill style={{ overflow: "hidden" }}>
                <OffthreadVideo
                    src={staticFile(videoSrc)}
                    startFrom={startFrom}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        ...(cropStyle ? {
                            // Crop-based: combine crop + micro-zoom
                            transform: `${cropStyle.transform} scale(${videoZoom.toFixed(4)})`,
                            transformOrigin: cropStyle.transformOrigin,
                            objectPosition: cropStyle.objectPosition,
                        } : {
                            // Legacy fallback
                            objectPosition: "center 90%",
                            transform: `scale(${videoZoom * 1.3})`,
                            transformOrigin: "center 85%",
                        }),
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
