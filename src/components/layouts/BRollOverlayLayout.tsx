import React from "react";
import { BRollPlayer } from "../BRollPlayer";
import { spacing } from "../../lib/theme";
import { BaseOverlayLayout } from "./BaseOverlayLayout";
import { useSlideIn } from "../../hooks";
import { animationDurations } from "../../lib/animation-presets";
import type { CropRegion } from "../../lib/types";

interface BRollOverlayLayoutProps {
    mainVideoSrc: string;
    brollSrc: string;
    brollType?: "video" | "image";
    overlayHeightRatio?: number;
    mainVideoStartFrom?: number;
    crop?: CropRegion;
}

/**
 * BRollOverlayLayout - B-Roll with slide-in animation
 *
 * Ana videoyu tam ekran gösterir ve üst kısma B-Roll overlay ekler
 * B-Roll yukarıdan kayarak girer
 *
 * Refactored: Uses BaseOverlayLayout + useSlideIn hook
 */
export const BRollOverlayLayout: React.FC<BRollOverlayLayoutProps> = ({
    mainVideoSrc,
    brollSrc,
    brollType = "video",
    overlayHeightRatio = spacing.overlayHeightRatio,
    mainVideoStartFrom = 0,
    crop,
}) => {
    // Slide-in animation using custom hook
    const { slideY, opacity } = useSlideIn({
        durationFrames: animationDurations.slideInBroll,
        yOffsetRange: [-100, 0],
    });

    return (
        <BaseOverlayLayout
            mainVideoSrc={mainVideoSrc}
            mainVideoStartFrom={mainVideoStartFrom}
            overlayHeightRatio={overlayHeightRatio}
            crop={crop}
        >
            {/* B-Roll overlay with slide-in animation */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    transform: `translateY(${slideY}px)`,
                    opacity,
                }}
            >
                <BRollPlayer src={brollSrc} type={brollType} />
            </div>
        </BaseOverlayLayout>
    );
};

export default BRollOverlayLayout;
