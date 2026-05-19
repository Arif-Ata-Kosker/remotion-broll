/**
 * Enrich command - Timeline enrichment with curator
 */

import chalk from "../logger";
import { validateApiKeys, getApiKeys } from "../utils/auth";
import { enrichTimeline } from "../curator";
import { OpenAIProvider } from "../providers/openai";
import { KieAiProvider } from "../providers/kie-ai";
import { PexelsProvider } from "../providers/pexels";
import * as fs from "fs";

interface EnrichOptions {
    apiKey?: string;
    elevenlabsApiKey?: string;
    kieApiKey?: string;
    pexelsApiKey?: string;
    timeline?: string;
}

/**
 * Enrich timeline command
 * Adds B-roll, voice, and other enhancements to timeline
 */
export async function enrichCommand(options: EnrichOptions) {
    try {
        const keys = getApiKeys(options);
        const { apiKey, elevenlabsApiKey } = keys;

        validateApiKeys(apiKey, elevenlabsApiKey);

        if (!options.timeline) {
            throw new Error("--timeline path is required");
        }

        if (!fs.existsSync(options.timeline)) {
            throw new Error(`Timeline file not found: ${options.timeline}`);
        }

        console.log(chalk.blue("🎨 Starting timeline enrichment..."));

        const kieKey = options.kieApiKey || process.env.KIE_AI_API_KEY || apiKey!;
        const pexelsKey = options.pexelsApiKey || process.env.PEXELS_API_KEY || "";

        await enrichTimeline({
            timelinePath: options.timeline,
            aiProvider: new OpenAIProvider(apiKey!),
            stockProvider: new PexelsProvider(pexelsKey),
            videoProvider: new KieAiProvider(kieKey),
        });

        console.log(chalk.green("✅ Timeline enrichment complete"));
    } catch (error) {
        console.error(chalk.red("❌ Enrichment failed:"), error);
        throw error;
    }
}
