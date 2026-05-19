/**
 * Asset Generation service
 * Handles AI image, video, and voice generation
 */

import {
    generateAiImage as generateImageV2,
    generateVoice as generateVoiceV2,
    generateVideoAsset as generateVideoV2,
} from "../service_v2";

/**
 * Generates AI image from prompt
 */
export async function generateAiImage(params: {
    prompt: string;
    apiKey?: string;
}): Promise<void> {
    return generateImageV2(params);
}

/**
 * Generates voice audio from text
 */
export async function generateVoice(
    text: string,
    apiKey: string,
    outputPath: string
): Promise<void> {
    return generateVoiceV2(text, apiKey, outputPath);
}

/**
 * Generates video asset via Kie.ai
 */
export async function generateVideoAsset(
    prompt: string,
    options: { baseUrl?: string; apiKey?: string; model?: string } = {}
): Promise<string> {
    return generateVideoV2(prompt, options);
}
