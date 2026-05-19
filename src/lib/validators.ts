/**
 * Runtime validation utilities
 * Provides runtime checks for data integrity
 */

import { z } from "zod";
import { ViralTimeline, Segment } from "./types";

/**
 * Validates timeline structure
 * @throws Error if timeline is invalid
 */
export function validateTimeline(timeline: unknown): asserts timeline is ViralTimeline {
    if (!timeline || typeof timeline !== "object") {
        throw new Error("Timeline must be an object");
    }

    const t = timeline as Partial<ViralTimeline>;

    if (!t.videoSrc || typeof t.videoSrc !== "string") {
        throw new Error("Timeline must have a valid videoSrc string");
    }

    if (!Array.isArray(t.segments)) {
        throw new Error("Timeline must have a segments array");
    }

    if (typeof t.totalDurationMs !== "number" || t.totalDurationMs <= 0) {
        throw new Error("Timeline must have a valid totalDurationMs");
    }

    // Validate each segment
    t.segments.forEach((segment, index) => {
        validateSegment(segment, index);
    });
}

/**
 * Validates individual segment
 * @throws Error if segment is invalid
 */
export function validateSegment(segment: unknown, index?: number): asserts segment is Segment {
    const prefix = index !== undefined ? `Segment ${index}` : "Segment";

    if (!segment || typeof segment !== "object") {
        throw new Error(`${prefix}: must be an object`);
    }

    const s = segment as Partial<Segment>;

    if (typeof s.id !== "number" && typeof s.id !== "string") {
        throw new Error(`${prefix}: must have a valid id`);
    }

    if (typeof s.startMs !== "number" || s.startMs < 0) {
        throw new Error(`${prefix}: must have a valid startMs (>= 0)`);
    }

    if (typeof s.endMs !== "number" || s.endMs <= s.startMs) {
        throw new Error(`${prefix}: must have a valid endMs (> startMs)`);
    }

    if (!s.layout || typeof s.layout !== "string") {
        throw new Error(`${prefix}: must have a valid layout string`);
    }
}

/**
 * Validates API key format
 */
export function validateApiKey(key: string, providerName: string): boolean {
    if (!key || key.trim().length === 0) {
        throw new Error(`${providerName} API key is required`);
    }

    if (key.length < 10) {
        throw new Error(`${providerName} API key appears to be invalid (too short)`);
    }

    return true;
}

/**
 * Validates file path
 */
export function validateFilePath(path: string): boolean {
    if (!path || path.trim().length === 0) {
        throw new Error("File path cannot be empty");
    }

    // Check for common path issues
    if (path.includes("..")) {
        throw new Error("File path cannot contain '..' (directory traversal)");
    }

    return true;
}

/**
 * Validates video URL
 */
export function validateVideoUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            throw new Error("Video URL must use http or https protocol");
        }
        return true;
    } catch (e) {
        throw new Error(`Invalid video URL: ${e instanceof Error ? e.message : "unknown error"}`);
    }
}

/**
 * Validates duration in milliseconds
 */
export function validateDuration(durationMs: number, name: string = "Duration"): boolean {
    if (typeof durationMs !== "number" || isNaN(durationMs)) {
        throw new Error(`${name} must be a valid number`);
    }

    if (durationMs <= 0) {
        throw new Error(`${name} must be greater than 0`);
    }

    if (durationMs > 3600000) {
        // 1 hour max
        throw new Error(`${name} is too long (max 1 hour)`);
    }

    return true;
}

/**
 * Schema-based validator using Zod
 */
export function createValidator<T>(schema: z.ZodType<T>) {
    return (data: unknown): T => {
        const result = schema.safeParse(data);
        if (!result.success) {
            throw new Error(
                `Validation failed:\n${result.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n")}`
            );
        }
        return result.data;
    };
}

/**
 * Validates color hex code
 */
export function validateHexColor(color: string): boolean {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
        throw new Error(`Invalid hex color: ${color} (must be #RRGGBB format)`);
    }
    return true;
}

/**
 * Validates frame number
 */
export function validateFrame(frame: number, totalFrames?: number): boolean {
    if (typeof frame !== "number" || isNaN(frame) || frame < 0) {
        throw new Error("Frame must be a non-negative number");
    }

    if (totalFrames !== undefined && frame >= totalFrames) {
        throw new Error(`Frame ${frame} exceeds total frames ${totalFrames}`);
    }

    return true;
}
