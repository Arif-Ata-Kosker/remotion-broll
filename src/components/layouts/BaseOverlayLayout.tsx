import React from "react";
import { AbsoluteFill } from "remotion";
import { MainVideoLayer, GradientOverlay, DecorativeLine } from "../shared";
import type { CropRegion } from "../../lib/types";

interface BaseOverlayLayoutProps {
    /** Ana video source */
    mainVideoSrc: string;
    /** Ana video başlangıç frame'i */
    mainVideoStartFrom?: number;
    /** Üst overlay için children content */
    children?: React.ReactNode;
    /** Overlay yükseklik oranı (0-1 arası) */
    overlayHeightRatio?: number;
    /** Dekoratif çizgi göster/gizle */
    showDecorativeLine?: boolean;
    /** Gradient overlay göster/gizle */
    showGradient?: boolean;
    /** Sanal kamera crop verisi */
    crop?: CropRegion;
}

/**
 * BaseOverlayLayout - Ortak overlay layout yapısı
 *
 * Tüm overlay layout'ların paylaştığı yapı:
 * 1. Tam ekran ana video
 * 2. Üst kısımda overlay bölgesi (children)
 * 3. Gradient geçiş efekti
 * 4. Dekoratif ayırıcı çizgi
 *
 * Used by: BRollOverlayLayout, ZoomOverlayLayout, CTAOverlayLayout
 */
export const BaseOverlayLayout: React.FC<BaseOverlayLayoutProps> = ({
    mainVideoSrc,
    mainVideoStartFrom = 0,
    children,
    overlayHeightRatio = 0.38,
    showDecorativeLine = true,
    showGradient = true,
    crop,
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Layer 1: Ana video - TAM EKRAN */}
            <MainVideoLayer
                videoSrc={mainVideoSrc}
                startFrom={mainVideoStartFrom}
                objectPosition="center 80%"
                crop={crop}
            />

            {/* Layer 2: Overlay Content (children) */}
            {children && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${overlayHeightRatio * 100}%`,
                        overflow: "hidden",
                    }}
                >
                    {children}
                </div>
            )}

            {/* Gradient overlay at overlay bottom */}
            {showGradient && children && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${overlayHeightRatio * 100}%`,
                        pointerEvents: "none",
                    }}
                >
                    <GradientOverlay position="bottom" height="35%" />
                </div>
            )}

            {/* Dekoratif çizgi - Overlay ve ana video arası */}
            {showDecorativeLine && children && (
                <DecorativeLine
                    topOffset={`${overlayHeightRatio * 100}%`}
                />
            )}
        </AbsoluteFill>
    );
};

export default BaseOverlayLayout;
