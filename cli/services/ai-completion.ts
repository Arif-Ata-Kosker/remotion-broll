/**
 * AI Completion service
 * Handles structured completion requests to OpenAI and Kie.ai
 */

import { z } from "zod";
import {
    openaiStructuredCompletion as openaiCompletionV2,
    setApiKey,
} from "../service_v2";

export { setApiKey };

/**
 * Gets structured completion from OpenAI
 * Returns validated response matching the provided Zod schema
 */
export async function openaiStructuredCompletion<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options: { baseUrl?: string; apiKey?: string; model?: string } = {}
): Promise<T> {
    return openaiCompletionV2(prompt, schema, options);
}

/**
 * Type for AI completion providers
 */
export type AIProvider = "openai" | "kie-ai";
