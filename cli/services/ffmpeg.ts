/**
 * FFmpeg service for video/audio operations
 */

import { execSync } from "child_process";
import * as path from "path";

/**
 * Extracts audio from video as WAV
 * - 16kHz sample rate (optimal for Whisper)
 * - Mono channel
 * - PCM 16-bit format
 */
export function extractAudioAsWav(videoPath: string, outputPath?: string): string {
    const audioPath = outputPath || path.join(path.dirname(videoPath), "temp_audio_recut.wav");

    execSync(
        `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`,
        { stdio: "ignore" }
    );

    return audioPath;
}

/**
 * Cuts video segment by timestamp
 */
export function cutVideoSegment(options: {
    inputPath: string;
    outputPath: string;
    startTime: number;
    endTime: number;
}) {
    const { inputPath, outputPath, startTime, endTime } = options;

    execSync(
        `ffmpeg -y -ss ${startTime} -to ${endTime} -i "${inputPath}" -c copy "${outputPath}"`,
        { stdio: "ignore" }
    );
}

/**
 * Gets video duration in seconds
 */
export function getVideoDuration(videoPath: string): number {
    const output = execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
        { encoding: "utf-8" }
    );

    return parseFloat(output.trim());
}

/**
 * Extracts a single frame from video as PNG
 */
export function extractFrame(videoPath: string, timestampSec: number, outputPath: string): string {
    execSync(
        `ffmpeg -y -ss ${timestampSec} -i "${videoPath}" -frames:v 1 -q:v 2 "${outputPath}"`,
        { stdio: "ignore" }
    );

    return outputPath;
}

/**
 * Gets video dimensions (width x height) via ffprobe
 */
export function getVideoDimensions(videoPath: string): { width: number; height: number } {
    const output = execSync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`,
        { encoding: "utf-8" }
    );

    const [width, height] = output.trim().split(",").map(Number);
    return { width, height };
}
