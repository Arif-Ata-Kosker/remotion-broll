/**
 * Kie.ai Provider
 * Implements AICompletionProvider and VideoGenerationProvider
 */

import { z } from "zod";
import { AICompletionProvider, VideoGenerationProvider } from "./types";
import { parseAndValidate } from "../utils/json-parser";
import { retry, RETRY_PRESETS } from "../utils/retry";
import { poll, POLLING_PRESETS, PollResult } from "../utils/polling";

export class KieAiProvider implements AICompletionProvider, VideoGenerationProvider {
    private apiKey: string;
    private baseUrl = "https://cloud.kie.ai";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Gets structured completion from Kie.ai
     */
    async complete<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
        const completionFn = async () => {
            // Step 1: Create task
            const taskId = await this.createChatTask(prompt);

            // Step 2: Poll for result
            const result = await poll(
                async () => this.pollChatTask(taskId),
                POLLING_PRESETS.kieAi
            );

            // Step 3: Parse and validate
            return parseAndValidate(result, schema);
        };

        return retry(completionFn, RETRY_PRESETS.default);
    }

    /**
     * Generates video from prompt using Kie.ai
     */
    async generateVideo(prompt: string): Promise<string> {
        const videoFn = async () => {
            // Step 1: Create video generation task
            const taskId = await this.createVideoTask(prompt);

            // Step 2: Poll for video URL
            const videoUrl = await poll(
                async () => this.pollVideoTask(taskId),
                POLLING_PRESETS.videoGeneration
            );

            return videoUrl;
        };

        return retry(videoFn, RETRY_PRESETS.conservative);
    }

    /**
     * Creates a chat completion task
     */
    private async createChatTask(prompt: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: "kie-chat-v1",
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
            throw new Error(`Kie.ai API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        return data.task_id;
    }

    /**
     * Polls chat task status
     */
    private async pollChatTask(taskId: string): Promise<PollResult<string>> {
        const response = await fetch(`${this.baseUrl}/api/chat/status/${taskId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Kie.ai polling error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();

        if (data.status === "completed") {
            return {
                status: "completed",
                data: data.result?.content || data.result,
            };
        }

        if (data.status === "failed") {
            return {
                status: "failed",
                error: data.error || "Task failed",
            };
        }

        return { status: "pending" };
    }

    /**
     * Creates a video generation task
     */
    private async createVideoTask(prompt: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/video/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                prompt,
                duration: 5,
                resolution: "1080p",
            }),
        });

        if (!response.ok) {
            throw new Error(`Kie.ai video API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        return data.task_id;
    }

    /**
     * Polls video generation task status
     */
    private async pollVideoTask(taskId: string): Promise<PollResult<string>> {
        const response = await fetch(`${this.baseUrl}/api/video/status/${taskId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Kie.ai video polling error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();

        if (data.status === "completed") {
            return {
                status: "completed",
                data: data.video_url,
            };
        }

        if (data.status === "failed") {
            return {
                status: "failed",
                error: data.error || "Video generation failed",
            };
        }

        return { status: "pending" };
    }
}
