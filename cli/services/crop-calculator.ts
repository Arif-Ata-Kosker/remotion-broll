/**
 * Crop Calculator Service
 * Calculates optimal crop regions per layout type based on face detection data
 */

import type { FaceDetectionResult } from "./face-detect";

// ==================== Types ====================

export interface CropRegion {
    x: number;          // Top-left X in source pixels
    y: number;          // Top-left Y in source pixels
    width: number;      // Crop width in source pixels
    height: number;     // Crop height in source pixels
    zoomLevel: number;  // Effective zoom level
}

export interface ZoomCrop {
    start: CropRegion;  // Wide shot (zoom-overlay start)
    end: CropRegion;    // Closeup shot (zoom-overlay end)
}

// ==================== Layout Presets ====================

type LayoutType = "closeup" | "closeup-cta" | "split-40-60" | "split-60-40" | "zoom-overlay" | "fullscreen-asset";

interface LayoutPreset {
    zoomLevel: number;
    verticalAnchor: "face-center" | "upper-body";
    horizontalAnchor: "face-center" | "frame-center";
}

const LAYOUT_PRESETS: Record<LayoutType, LayoutPreset> = {
    "closeup": {
        zoomLevel: 2.0,
        verticalAnchor: "face-center",
        horizontalAnchor: "face-center",
    },
    "closeup-cta": {
        zoomLevel: 1.8,
        verticalAnchor: "upper-body",
        horizontalAnchor: "face-center",
    },
    "split-40-60": {
        zoomLevel: 1.5,
        verticalAnchor: "upper-body",
        horizontalAnchor: "face-center",
    },
    "split-60-40": {
        zoomLevel: 1.7,
        verticalAnchor: "upper-body",
        horizontalAnchor: "face-center",
    },
    "zoom-overlay": {
        zoomLevel: 1.0,
        verticalAnchor: "face-center",
        horizontalAnchor: "frame-center",
    },
    "fullscreen-asset": {
        zoomLevel: 1.0,
        verticalAnchor: "face-center",
        horizontalAnchor: "frame-center",
    },
};

// ==================== Core Functions ====================

/**
 * Calculates a 9:16 crop region centered on the detected face,
 * adjusted per layout type.
 */
export function calculateCropRegion(
    face: FaceDetectionResult,
    layout: LayoutType,
    zoomOverride?: number
): CropRegion {
    const { sourceWidth, sourceHeight } = face;
    const preset = LAYOUT_PRESETS[layout];
    const zoom = zoomOverride ?? preset.zoomLevel;

    // No crop for fullscreen-asset
    if (layout === "fullscreen-asset") {
        return {
            x: 0,
            y: 0,
            width: sourceWidth,
            height: sourceHeight,
            zoomLevel: 1.0,
        };
    }

    // Calculate crop dimensions (same aspect ratio as source since both are 9:16)
    const cropWidth = Math.round(sourceWidth / zoom);
    const cropHeight = Math.round(sourceHeight / zoom);

    // Determine horizontal anchor in source pixels
    let anchorX: number;
    if (preset.horizontalAnchor === "face-center") {
        anchorX = face.faceCenter.x * sourceWidth;
    } else {
        anchorX = sourceWidth / 2;
    }

    // Determine vertical anchor
    const faceTopPx = face.faceBoundingBox.y * sourceHeight;
    const faceCenterYPx = face.faceCenter.y * sourceHeight;

    let cropY: number;
    if (preset.verticalAnchor === "face-center") {
        // Position face center at ~35% from top of crop (rule of thirds)
        cropY = faceCenterYPx - cropHeight * 0.35;
    } else {
        // upper-body: Position face top at ~20% from crop top
        cropY = faceTopPx - cropHeight * 0.20;
    }

    // Center crop horizontally on anchor
    let cropX = Math.round(anchorX - cropWidth / 2);
    cropY = Math.round(cropY);

    // Clamp to source frame boundaries
    cropX = Math.max(0, Math.min(cropX, sourceWidth - cropWidth));
    cropY = Math.max(0, Math.min(cropY, sourceHeight - cropHeight));

    return {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
        zoomLevel: zoom,
    };
}

/**
 * For zoom-overlay layout: both START (wide) and END (closeup) crop regions.
 */
export function calculateZoomOverlayCrops(face: FaceDetectionResult): ZoomCrop {
    return {
        start: calculateCropRegion(face, "fullscreen-asset"),
        end: calculateCropRegion(face, "closeup", 1.8),
    };
}

/**
 * Generates crop regions for all segments in a timeline.
 */
export function generateAllCropRegions(
    face: FaceDetectionResult,
    segments: Array<{ id: number; layout: string; zoom?: number }>
): Map<number, { crop?: CropRegion; zoomCrop?: ZoomCrop }> {
    const crops = new Map<number, { crop?: CropRegion; zoomCrop?: ZoomCrop }>();

    for (const segment of segments) {
        const layout = segment.layout as LayoutType;

        if (layout === "fullscreen-asset") {
            crops.set(segment.id, {});
            continue;
        }

        if (layout === "zoom-overlay") {
            crops.set(segment.id, { zoomCrop: calculateZoomOverlayCrops(face) });
        } else {
            crops.set(segment.id, {
                crop: calculateCropRegion(face, layout, segment.zoom),
            });
        }
    }

    return crops;
}
