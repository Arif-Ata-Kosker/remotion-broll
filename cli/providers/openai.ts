/**
 * OpenAI Provider
 * Implements AICompletionProvider and TranscriptionProvider
 */

import { z } from "zod";
import { AICompletionProvider, TranscriptionProvider, TranscriptionResult } from "./types";
import { parseAndValidate } from "../utils/json-parser";
import { retry, RETRY_PRESETS } from "../utils/retry";

export class OpenAIProvider implements AICompletionProvider, TranscriptionProvider {
    private apiKey: string;
    private baseUrl = "https://api.openai.com/v1";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Gets structured completion from GPT-4
     */
    async complete<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
        const completionFn = async () => {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant that returns valid JSON.",
                        },
                        {
                            role: "user",
                            content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON.",
                        },
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            const text = data.choices[0]?.message?.content;

            if (!text) {
                throw new Error("No response from OpenAI");
            }

            return parseAndValidate(text, schema);
        };

        return retry(completionFn, RETRY_PRESETS.default);
    }

    /**
     * Transcribes audio using Whisper API
     */
    async transcribe(audioPath: string): Promise<TranscriptionResult> {
        const fs = await import("fs");
        const FormData = await import("form-data");

        const form = new FormData.default();
        form.append("file", fs.createReadStream(audioPath));
        form.append("model", "whisper-1");
        form.append("response_format", "verbose_json");
        form.append("timestamp_granularities[]", "word");

        const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                ...form.getHeaders(),
            },
            body: form as any,
        });

        if (!response.ok) {
            throw new Error(`Whisper API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        return {
            text: data.text,
            words: data.words,
        };
    }
}
