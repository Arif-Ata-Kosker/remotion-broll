/**
 * Provider interfaces for external services
 * Abstracts API calls behind common interfaces
 */

import { z } from "zod";

/**
 * AI Completion Provider Interface
 * Handles structured AI completions with schema validation
 */
export interface AICompletionProvider {
    /**
     * Gets structured completion from AI model
     * @param prompt - User prompt
     * @param schema - Zod schema for validation
     * @returns Validated response matching schema
     */
    complete<T>(prompt: string, schema: z.ZodType<T>): Promise<T>;
}

/**
 * Video Generation Provider Interface
 * Handles AI video generation
 */
export interface VideoGenerationProvider {
    /**
     * Generates video from prompt
     * @param prompt - Video generation prompt
     * @returns URL or path to generated video
     */
    generateVideo(prompt: string): Promise<string>;
}

/**
 * Transcription Provider Interface
 * Handles audio-to-text with timestamps
 */
export interface TranscriptionProvider {
    /**
     * Transcribes audio file
     * @param audioPath - Path to audio file
     * @returns Transcript with word-level timestamps
     */
    transcribe(audioPath: string): Promise<TranscriptionResult>;
}

export interface TranscriptionResult {
    text: string;
    words?: Array<{
        word: string;
        start: number;
        end: number;
    }>;
}

/**
 * Stock Video Provider Interface
 * Handles stock video/image search
 */
export interface StockVideoProvider {
    /**
     * Searches for stock video/image
     * @param query - Search query
     * @returns URL to stock asset
     */
    search(query: string): Promise<string>;
}

/**
 * Generic polling configuration
 */
export interface PollingConfig {
    /** Interval between polls (ms) */
    interval: number;
    /** Maximum number of retries */
    maxRetries: number;
    /** Timeout per request (ms) */
    timeout?: number;
}

/**
 * Generic retry configuration
 */
export interface RetryConfig {
    /** Maximum number of retries */
    maxRetries: number;
    /** Initial delay (ms) */
    initialDelay: number;
    /** Backoff multiplier */
    backoffMultiplier: number;
    /** Maximum delay (ms) */
    maxDelay: number;
}
