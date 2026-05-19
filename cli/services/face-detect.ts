/**
 * Face detection service
 * Extracts frames via FFmpeg and detects face position via Python MediaPipe
 */

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { extractFrame } from "./ffmpeg";

// ==================== Types ====================

export interface FaceDetectionResult {
    faceBoundingBox: {
        x: number;      // normalized 0-1
        y: number;      // normalized 0-1
        width: number;  // normalized 0-1
        height: number; // normalized 0-1
    };
    faceCenter: {
        x: number; // 0-1, 0.5 = horizontal center
        y: number; // 0-1, 0.0 = top, 1.0 = bottom
    };
    sourceWidth: number;
    sourceHeight: number;
    confidence: number;
}

// ==================== Functions ====================

const PYTHON_PATH = "C:\\Users\\arifa\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";
const DETECT_SCRIPT = path.join(__dirname, "..", "scripts", "detect_face.py");

/**
 * Extracts a frame from video for face detection
 */
export function extractFrameForDetection(
    videoPath: string,
    timestampSec: number,
    outputDir: string
): string {
    const framePath = path.join(outputDir, "face_detect_frame.png");
    return extractFrame(videoPath, timestampSec, framePath);
}

/**
 * Detects face in an image using Python MediaPipe script
 */
export function detectFace(framePath: string): FaceDetectionResult {
    if (!fs.existsSync(framePath)) {
        throw new Error(`Frame file not found: ${framePath}`);
    }

    // Determine Python executable
    let pythonExe = PYTHON_PATH;
    if (!fs.existsSync(pythonExe)) {
        // Fallback: try system python
        pythonExe = "python";
    }

    const result = execSync(
        `"${pythonExe}" "${DETECT_SCRIPT}" "${framePath}"`,
        { encoding: "utf-8", timeout: 60000 }
    );

    const parsed = JSON.parse(result.trim());

    if (parsed.error) {
        throw new Error(`Face detection failed: ${parsed.error}`);
    }

    return parsed as FaceDetectionResult;
}

/**
 * Full pipeline: extract frame from video and detect face
 */
export function detectFaceInVideo(
    videoPath: string,
    outputDir: string,
    timestampSec: number = 2.0
): FaceDetectionResult {
    const framePath = extractFrameForDetection(videoPath, timestampSec, outputDir);

    try {
        const result = detectFace(framePath);
        return result;
    } finally {
        // Cleanup temp frame
        if (fs.existsSync(framePath)) {
            fs.unlinkSync(framePath);
        }
    }
}
