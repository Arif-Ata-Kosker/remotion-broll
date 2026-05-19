/**
 * detect-face CLI command
 * Detects face position in source video and injects crop data into timeline.json
 *
 * Pipeline step: recut → detect-face → enrich → render
 */

import * as fs from "fs";
import * as path from "path";
import chalk from "../logger";
import { detectFaceInVideo } from "../services/face-detect";
import { getVideoDimensions } from "../services/ffmpeg";
import { calculateCropRegion, calculateZoomOverlayCrops } from "../services/crop-calculator";
import type { LayoutType } from "../../src/lib/types";

interface DetectFaceOptions {
    videoPath: string;
    timelinePath: string;
    timestamp: number;
}

export async function detectFaceCommand(options: DetectFaceOptions) {
    console.log(chalk.blue("\n--- Face Detection & Crop Calculation ---\n"));

    // 1. Validate inputs
    if (!fs.existsSync(options.videoPath)) {
        throw new Error(`Video not found: ${options.videoPath}`);
    }
    if (!fs.existsSync(options.timelinePath)) {
        throw new Error(`Timeline not found: ${options.timelinePath}`);
    }

    // 2. Get source dimensions
    const dims = getVideoDimensions(options.videoPath);
    console.log(chalk.gray(`   Source: ${dims.width}x${dims.height}`));

    // 3. Detect face
    const outputDir = path.dirname(options.timelinePath);
    console.log(chalk.gray(`   Extracting frame at ${options.timestamp}s...`));

    const faceResult = detectFaceInVideo(options.videoPath, outputDir, options.timestamp);

    if (faceResult.confidence > 0) {
        console.log(chalk.green(
            `   Face detected! Center: (${faceResult.faceCenter.x.toFixed(3)}, ${faceResult.faceCenter.y.toFixed(3)}), Confidence: ${(faceResult.confidence * 100).toFixed(1)}%`
        ));
    } else {
        console.log(chalk.yellow(
            `   No face detected - using fallback center position`
        ));
    }

    // 4. Load timeline
    const timelineRaw = fs.readFileSync(options.timelinePath, "utf-8");
    const timeline = JSON.parse(timelineRaw);

    // 5. Store face detection metadata
    timeline.faceDetection = {
        faceCenter: faceResult.faceCenter,
        sourceWidth: faceResult.sourceWidth,
        sourceHeight: faceResult.sourceHeight,
        confidence: faceResult.confidence,
    };

    // 6. Calculate crop regions per segment
    let cropCount = 0;
    for (const segment of timeline.segments) {
        const layout = segment.layout as LayoutType;

        if (layout === "fullscreen-asset") {
            console.log(chalk.gray(`   Segment ${segment.id} (${layout}): no crop needed`));
            continue;
        }

        if (layout === "zoom-overlay") {
            const zoomCrops = calculateZoomOverlayCrops(faceResult);
            segment.zoomCrop = {
                start: zoomCrops.start,
                end: zoomCrops.end,
            };
            console.log(chalk.green(
                `   Segment ${segment.id} (${layout}): zoom ${zoomCrops.start.zoomLevel}x -> ${zoomCrops.end.zoomLevel}x`
            ));
            cropCount++;
        } else {
            const crop = calculateCropRegion(faceResult, layout as Parameters<typeof calculateCropRegion>[1], segment.zoom);
            segment.crop = crop;
            console.log(chalk.green(
                `   Segment ${segment.id} (${layout}): crop ${crop.width}x${crop.height} at (${crop.x}, ${crop.y}), zoom ${crop.zoomLevel}x`
            ));
            cropCount++;
        }
    }

    // 7. Write updated timeline
    fs.writeFileSync(options.timelinePath, JSON.stringify(timeline, null, 2));

    console.log(chalk.green(`\n   ${cropCount} segments updated with crop data`));
    console.log(chalk.green("   Timeline saved!\n"));
}
