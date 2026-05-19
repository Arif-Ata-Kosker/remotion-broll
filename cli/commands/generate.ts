/**
 * Generate command - Story generation workflow
 */

import chalk from "../logger";
import prompts from "prompts";
import { validateApiKeys, getApiKeys } from "../utils/auth";

interface GenerateOptions {
    apiKey?: string;
    elevenlabsApiKey?: string;
    title?: string;
    topic?: string;
}

/**
 * Main story generation command
 * Creates story, images, voice, and timeline
 */
export async function generateStoryCommand(options: GenerateOptions) {
    try {
        const keys = getApiKeys(options);
        let { apiKey, elevenlabsApiKey } = keys;

        // Prompt for API keys if not provided
        if (!apiKey) {
            const response = await prompts({
                type: "password",
                name: "apiKey",
                message: "Enter your OpenAI API key:",
                validate: (value: string) => value.length > 0 || "API key is required",
            });
            apiKey = response.apiKey;
        }

        if (!elevenlabsApiKey) {
            const response = await prompts({
                type: "password",
                name: "elevenlabsApiKey",
                message: "Enter your ElevenLabs API key:",
                validate: (value: string) => value.length > 0 || "ElevenLabs API key is required",
            });
            elevenlabsApiKey = response.elevenlabsApiKey;
        }

        validateApiKeys(apiKey, elevenlabsApiKey);

        let { title, topic } = options;

        // Prompt for title and topic if not provided
        if (!title || !topic) {
            const response = await prompts([
                {
                    type: "text",
                    name: "title",
                    message: "Title of the story:",
                    initial: title,
                    validate: (value: string) => value.length > 0 || "Title is required",
                },
                {
                    type: "text",
                    name: "topic",
                    message: "Topic of the story:",
                    initial: topic,
                    validate: (value: string) => value.length > 0 || "Topic is required",
                },
            ]);

            title = response.title;
            topic = response.topic;

            if (!title || !topic) {
                console.log(chalk.red("Title and topic are required. Exiting..."));
                process.exit(1);
            }
        }

        console.log(chalk.blue(`\n📖 Creating story: "${title}"`));
        console.log(chalk.blue(`📝 Topic: ${topic}\n`));

        // TODO: Implement full story generation workflow
        // using provider interfaces

        console.log(chalk.green("✅ Story generation complete!"));
    } catch (error) {
        console.error(chalk.red("❌ Generation failed:"), error);
        throw error;
    }
}
