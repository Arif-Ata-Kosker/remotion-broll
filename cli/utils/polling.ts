/**
 * Generic polling utility
 * Used for async job completion (Kie.ai, video generation, etc.)
 */

import { PollingConfig } from "../providers/types";

export interface PollResult<T> {
    status: "pending" | "completed" | "failed";
    data?: T;
    error?: string;
}

/**
 * Generic polling function with configurable retry logic
 *
 * @param pollFn - Function that checks job status
 * @param config - Polling configuration
 * @returns Result data when job completes
 * @throws Error if max retries exceeded or job failed
 */
export async function poll<T>(
    pollFn: () => Promise<PollResult<T>>,
    config: PollingConfig
): Promise<T> {
    const { interval, maxRetries } = config;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        await sleep(interval);

        try {
            const result = await pollFn();

            if (result.status === "completed" && result.data) {
                return result.data;
            }

            if (result.status === "failed") {
                throw new Error(result.error || "Job failed");
            }

            // Status is "pending", continue polling
        } catch (error) {
            // If this is the last attempt, throw
            if (attempt === maxRetries - 1) {
                throw error;
            }
            // Otherwise continue polling
        }
    }

    throw new Error(`Polling timeout: exceeded ${maxRetries} attempts`);
}

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Predefined polling configs for common use cases
 */
export const POLLING_PRESETS = {
    /** Kie.ai jobs: 120 retries x 2s = 4 minutes */
    kieAi: {
        interval: 2000,
        maxRetries: 120,
    },
    /** Video asset generation: 300 retries x 3s = 15 minutes */
    videoGeneration: {
        interval: 3000,
        maxRetries: 300,
    },
    /** Fast polling: 30 retries x 1s = 30 seconds */
    fast: {
        interval: 1000,
        maxRetries: 30,
    },
} as const;
