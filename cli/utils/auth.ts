/**
 * API Key validation utilities
 */

/**
 * Validates that required API keys are present
 * Throws error if keys are missing
 */
export function validateApiKeys(apiKey?: string, elevenlabsApiKey?: string) {
    if (!apiKey) {
        throw new Error(
            "❌ OpenAI API key is required. Pass --apiKey or set OPENAI_API_KEY in .env"
        );
    }

    if (!elevenlabsApiKey) {
        throw new Error(
            "❌ ElevenLabs API key is required. Pass --elevenlabsApiKey or set ELEVENLABS_API_KEY in .env"
        );
    }
}

/**
 * Gets API keys from options or environment variables
 */
export function getApiKeys(options: { apiKey?: string; elevenlabsApiKey?: string }) {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    const elevenlabsApiKey = options.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY;

    return { apiKey, elevenlabsApiKey };
}
