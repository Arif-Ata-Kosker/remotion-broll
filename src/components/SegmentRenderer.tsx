import React from "react";
import { Segment } from "../lib/types";
import { msToFrames } from "../lib/utils";
import { spacing } from "../lib/theme";
import {
    BRollOverlayLayout,
    CloseupLayout,
    BRollOnlyLayout,
    CTAOverlayLayout,
    ZoomOverlayLayout,
} from "./layouts";

interface SegmentRendererProps {
    segment: Segment;
    globalVideoSrc: string;
}

/**
 * SegmentRenderer - Layout routing based on segment type
 *
 * Determines which layout component to render based on segment.layout
 * Handles fallbacks when B-Roll assets are missing
 */
export const SegmentRenderer: React.FC<SegmentRendererProps> = ({ segment, globalVideoSrc }) => {
    const videoSrc = segment.videoSrc || globalVideoSrc;
    // If segment has its own videoSrc file, start from 0; otherwise offset into global video
    const startFrom = segment.videoSrc ? 0 : msToFrames(segment.startMs);
    const broll = segment.broll;
    const crop = segment.crop;
    const zoomCrop = segment.zoomCrop;

    switch (segment.layout) {
        case "split-40-60":
            return broll?.src ? (
                <BRollOverlayLayout
                    mainVideoSrc={videoSrc}
                    brollSrc={broll.src}
                    brollType={broll.type}
                    overlayHeightRatio={spacing.overlayHeightRatio}
                    mainVideoStartFrom={startFrom}
                    crop={crop}
                />
            ) : (
                <CloseupLayout videoSrc={videoSrc} startFrom={startFrom} zoom={1.0} crop={crop} />
            );

        case "split-60-40":
            return broll?.src ? (
                <BRollOverlayLayout
                    mainVideoSrc={videoSrc}
                    brollSrc={broll.src}
                    brollType={broll.type}
                    overlayHeightRatio={spacing.overlayHeightRatio}
                    mainVideoStartFrom={startFrom}
                    crop={crop}
                />
            ) : (
                <CloseupLayout videoSrc={videoSrc} startFrom={startFrom} zoom={1.0} crop={crop} />
            );

        case "fullscreen-asset":
            return broll?.src ? (
                <BRollOnlyLayout
                    brollSrc={broll.src}
                    mainVideoSrc={videoSrc}
                    mainVideoStartFrom={startFrom}
                />
            ) : (
                <CloseupLayout videoSrc={videoSrc} startFrom={startFrom} zoom={1.0} crop={crop} />
            );

        case "closeup":
            return (
                <CloseupLayout
                    videoSrc={videoSrc}
                    startFrom={startFrom}
                    zoom={segment.zoom ?? 1.4}
                    crop={crop}
                />
            );

        case "closeup-cta":
            return (
                <CTAOverlayLayout
                    videoSrc={videoSrc}
                    startFrom={startFrom}
                    crop={crop}
                />
            );

        case "zoom-overlay":
            return broll?.src ? (
                <ZoomOverlayLayout
                    mainVideoSrc={videoSrc}
                    brollSrc={broll.src}
                    brollType={broll.type}
                    mainVideoStartFrom={startFrom}
                    zoomDurationMs={segment.zoomDurationMs ?? 2000}
                    zoomCrop={zoomCrop}
                />
            ) : (
                <CloseupLayout videoSrc={videoSrc} startFrom={startFrom} zoom={1.0} crop={crop} />
            );

        default:
            return (
                <CloseupLayout videoSrc={videoSrc} startFrom={startFrom} zoom={1.0} crop={crop} />
            );
    }
};

export default SegmentRenderer;
