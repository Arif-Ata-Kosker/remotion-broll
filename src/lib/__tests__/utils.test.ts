import { describe, it, expect } from "vitest";
import { msToFrames, framesToMs, formatTime } from "../utils";

describe("msToFrames", () => {
    it("converts milliseconds to frames (30 FPS)", () => {
        expect(msToFrames(1000)).toBe(30); // 1 second = 30 frames
        expect(msToFrames(2000)).toBe(60); // 2 seconds = 60 frames
        expect(msToFrames(500)).toBe(15); // 0.5 seconds = 15 frames
    });

    it("handles zero and negative values", () => {
        expect(msToFrames(0)).toBe(0);
        expect(msToFrames(-1000)).toBe(-30);
    });

    it("floors fractional frames", () => {
        expect(msToFrames(100)).toBe(3); // 100ms = 3 frames (floors 3.0)
        expect(msToFrames(150)).toBe(4); // 150ms = 4.5 frames → 4
    });
});

describe("framesToMs", () => {
    it("converts frames to milliseconds (30 FPS)", () => {
        expect(framesToMs(30)).toBe(1000); // 30 frames = 1 second
        expect(framesToMs(60)).toBe(2000); // 60 frames = 2 seconds
        expect(framesToMs(15)).toBe(500); // 15 frames = 0.5 seconds
    });

    it("handles zero and negative values", () => {
        expect(framesToMs(0)).toBe(0);
        expect(framesToMs(-30)).toBe(-1000);
    });

    it("handles fractional frames", () => {
        expect(framesToMs(1)).toBeCloseTo(33.33, 1); // 1 frame ≈ 33.33ms at 30fps
    });
});

describe("formatTime", () => {
    it("formats time correctly", () => {
        expect(formatTime(0)).toBe("0:00");
        expect(formatTime(5000)).toBe("0:05"); // 5 seconds
        expect(formatTime(60000)).toBe("1:00"); // 1 minute
        expect(formatTime(125000)).toBe("2:05"); // 2 minutes 5 seconds
    });

    it("pads seconds with leading zero", () => {
        expect(formatTime(3000)).toBe("0:03");
        expect(formatTime(90000)).toBe("1:30");
    });

    it("handles large durations", () => {
        expect(formatTime(600000)).toBe("10:00"); // 10 minutes
        expect(formatTime(3661000)).toBe("61:01"); // 61 minutes 1 second
    });

    it("floors partial seconds", () => {
        expect(formatTime(5999)).toBe("0:05"); // 5.999 seconds → 0:05
    });
});
