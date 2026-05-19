/**
 * Transcription service
 * Handles audio transcription via Whisper API
 */

import { transcribeAudio as transcribeAudioV2 } from "../service_v2";

export interface TranscriptionWord {
    word: string;
    start: number;
    end: number;
}

export interface TranscriptionResult {
    text: string;
    words?: TranscriptionWord[];
}

/**
 * Transcribes audio file using Whisper API
 * Returns text with word-level timestamps
 */
export async function transcribeAudio(
    audioPath: string,
    apiKey: string
): Promise<TranscriptionResult> {
    return transcribeAudioV2(audioPath, apiKey);
}
