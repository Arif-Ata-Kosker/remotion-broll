/**
 * Crop transform utilities for virtual camera movement.
 * Converts CropRegion data (source pixels) into CSS transform styles.
 *
 * Source dimensions are derived from crop data: sourceW = crop.width * crop.zoomLevel
 */

import { interpolate, useCurrentFrame } from "remotion";
import type { CropRegion, ZoomCrop } from "../lib/types";

interface CropTransformStyle {
	transform: string;
	transformOrigin: string;
	objectPosition: string;
}

/**
 * Converts a CropRegion into CSS transform style for an OffthreadVideo element.
 *
 * The video element must have: width: "100%", height: "100%", objectFit: "cover"
 * inside a container with overflow: "hidden".
 *
 * Source dimensions are derived: sourceWidth = crop.width * crop.zoomLevel
 */
export function getCropTransformStyle(crop: CropRegion): CropTransformStyle {
	const sourceWidth = crop.width * crop.zoomLevel;
	const sourceHeight = crop.height * crop.zoomLevel;
	const scale = crop.zoomLevel;
	const translateXPercent = -(crop.x / sourceWidth) * 100;
	const translateYPercent = -(crop.y / sourceHeight) * 100;

	return {
		transform: `scale(${scale.toFixed(4)}) translate(${translateXPercent.toFixed(4)}%, ${translateYPercent.toFixed(4)}%)`,
		transformOrigin: "0 0",
		objectPosition: "top left",
	};
}

/**
 * Animated crop transform for zoom-overlay layout.
 * Interpolates from wide crop to closeup crop over a given duration.
 *
 * Source dimensions derived from start crop (zoomLevel=1.0, so start.width = sourceWidth).
 */
export function useAnimatedCropTransform(
	zoomCrop: ZoomCrop,
	durationFrames: number,
): CropTransformStyle {
	const frame = useCurrentFrame();

	// Source dimensions from start crop (full frame, zoomLevel=1.0)
	const sourceWidth = zoomCrop.start.width * zoomCrop.start.zoomLevel;
	const sourceHeight = zoomCrop.start.height * zoomCrop.start.zoomLevel;

	const progress = interpolate(frame, [0, durationFrames], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Interpolate crop region
	const cropX = interpolate(progress, [0, 1], [zoomCrop.start.x, zoomCrop.end.x]);
	const cropY = interpolate(progress, [0, 1], [zoomCrop.start.y, zoomCrop.end.y]);
	const cropW = interpolate(progress, [0, 1], [zoomCrop.start.width, zoomCrop.end.width]);

	const scale = sourceWidth / cropW;
	const translateXPercent = -(cropX / sourceWidth) * 100;
	const translateYPercent = -(cropY / sourceHeight) * 100;

	return {
		transform: `scale(${scale.toFixed(4)}) translate(${translateXPercent.toFixed(4)}%, ${translateYPercent.toFixed(4)}%)`,
		transformOrigin: "0 0",
		objectPosition: "top left",
	};
}
