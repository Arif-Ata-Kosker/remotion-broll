import { staticFile } from "remotion";
import { ViralTimeline } from "./types";
import { FPS } from "./constants";

// ==================== Viral Timeline Utils ====================

export const loadViralTimelineFromFile = async (filename: string) => {
    const res = await fetch(staticFile(filename));
    const json = await res.json();
    const timeline = json as ViralTimeline;

    // Video süresini timeline'dan hesapla (hook intro yok artık)
    const totalFrames = Math.ceil((timeline.totalDurationMs / 1000) * FPS);

    return { timeline, lengthFrames: totalFrames };
};

export const getViralTimelinePath = (proj: string) =>
    `content/${proj}/timeline.json`;

export const getSentenceSegmentsPath = (proj: string) =>
    `content/${proj}/sentence-segments.json`;

export const loadSentenceSegments = async (filename: string) => {
    try {
        const res = await fetch(staticFile(filename));
        if (!res.ok) return [];
        const json = await res.json();
        type SentenceShape = { startMs: number; endMs: number; text: string };
        type SegShape = { sentences?: SentenceShape[] };
        const segs = (json?.segments ?? []) as SegShape[];
        return segs.flatMap((s) => s.sentences ?? []);
    } catch {
        return [];
    }
};

// ==================== Utility Functions ====================

export const msToFrames = (ms: number): number => {
    return Math.floor((ms / 1000) * FPS);
};

export const framesToMs = (frames: number): number => {
    return (frames / FPS) * 1000;
};

export const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// ==================== Legacy Utils ====================
// Legacy functions moved to _legacy/utils-legacy.ts
// Re-exported here for backward compatibility

export {
    loadTimelineFromFile,
    calculateFrameTiming,
    calculateBlur,
    getTimelinePath,
    getImagePath,
    getAudioPath,
} from "./_legacy/utils-legacy";

