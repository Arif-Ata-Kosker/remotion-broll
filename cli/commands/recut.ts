/**
 * Recut command - Video recutting with transcript alignment
 */

import chalk from "../logger";
import { getApiKeys } from "../utils/auth";
import { recutVideo as recutVideoOriginal } from "../recut";

interface RecutOptions {
    apiKey?: string;
    video?: string;
    script?: string;
}

/**
 * Recut video command
 * Aligns video cuts with script using transcription
 */
export async function recutCommand(options: RecutOptions) {
    try {
        const { apiKey } = getApiKeys(options);

        if (!apiKey) {
            throw new Error("OpenAI API key is required for transcription");
        }

        if (!options.video || !options.script) {
            throw new Error("--video and --script paths are required");
        }

        console.log(chalk.blue("🎬 Starting recut command..."));

        await recutVideoOriginal({
            videoPath: options.video,
            scriptPath: options.script,
            apiKey,
        });

        console.log(chalk.green("✅ Recut complete!"));
    } catch (error) {
        console.error(chalk.red("❌ Recut failed:"), error);
        throw error;
    }
}
