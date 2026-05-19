/**
 * Legacy Types from AIVideo System
 * These types are for the old timeline format (before ViralTimeline)
 * Kept for backward compatibility with legacy components
 */

import { z } from "zod";

export interface ElementAnimation {
    type: string;
    from: number;
    to: number;
    startMs: number;
    endMs: number;
}

export interface BackgroundElement {
    startMs: number;
    endMs: number;
    imageUrl: string;
    enterTransition: string;
    exitTransition: string;
    animations: ElementAnimation[];
}

export interface TextElement {
    startMs: number;
    endMs: number;
    text: string;
    position: string;
    animations: ElementAnimation[];
}

export const StoryScript = z.object({
    text: z.string(),
});

export const StoryWithImages = z.object({
    result: z.array(
        z.object({
            text: z.string(),
            imageDescription: z.string(),
        })
    ),
});

export interface AudioTimestamps {
    characters: string[];
    characterStartTimesSeconds: number[];
    characterEndTimesSeconds: number[];
}

export interface ContentItemWithDetails {
    text: string;
    imageDescription: string;
    uid: string;
    audioTimestamps: AudioTimestamps;
}

export interface StoryMetadataWithDetails {
    shortTitle: string;
    content: ContentItemWithDetails[];
}

export interface Timeline {
    elements: BackgroundElement[];
    text: TextElement[];
    audio: {
        startMs: number;
        endMs: number;
        audioUrl: string;
    }[];
    shortTitle: string;
}
