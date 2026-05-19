/**
 * JSON parser for AI responses
 * Handles markdown code blocks and malformed JSON
 */

import { z } from "zod";

/**
 * Parses JSON from AI response, cleaning markdown artifacts
 *
 * Handles:
 * - Markdown code blocks: ```json ... ```
 * - Text before/after JSON
 * - Escaped characters
 *
 * @param text - Raw AI response text
 * @returns Parsed JSON object
 * @throws Error if JSON parsing fails
 */
export function parseAIResponse(text: string): unknown {
    // Remove markdown code blocks if present
    let cleaned = text.trim();

    // Remove ```json or ``` wrappers
    cleaned = cleaned.replace(/^```json?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");

    // Try to find JSON object/array boundaries
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

    for (const match of [objectMatch, arrayMatch]) {
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                continue;
            }
        }
    }

    // Last resort: try parsing the whole cleaned text
    try {
        return JSON.parse(cleaned);
    } catch (error) {
        throw new Error(
            `Failed to parse JSON from AI response: ${(error as Error).message}\n` +
            `Cleaned text: ${cleaned.substring(0, 200)}...`
        );
    }
}

/**
 * Parses and validates AI response with Zod schema
 *
 * @param text - Raw AI response text
 * @param schema - Zod schema for validation
 * @returns Validated data matching schema
 * @throws Error if parsing or validation fails
 */
export function parseAndValidate<T>(
    text: string,
    schema: z.ZodType<T>
): T {
    const parsed = parseAIResponse(text);
    const result = schema.safeParse(parsed);

    if (!result.success) {
        throw new Error(
            `AI response validation failed:\n${JSON.stringify(result.error.issues, null, 2)}`
        );
    }

    return result.data;
}

/**
 * Extracts JSON from mixed text response
 * More aggressive than parseAIResponse
 *
 * @param text - Text containing JSON somewhere
 * @returns First valid JSON object/array found
 * @throws Error if no valid JSON found
 */
export function extractJSON(text: string): unknown {
    // Try standard parsing first
    try {
        return parseAIResponse(text);
    } catch {
        // Fallback: try to find any valid JSON in text
        const lines = text.split("\n");

        for (let i = 0; i < lines.length; i++) {
            for (let j = lines.length; j > i; j--) {
                const subset = lines.slice(i, j).join("\n");
                try {
                    return JSON.parse(subset);
                } catch {
                    // Continue searching
                }
            }
        }

        throw new Error("No valid JSON found in text");
    }
}
