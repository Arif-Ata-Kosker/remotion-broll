/**
 * Retry utility with exponential backoff
 * Used for transient failures (network errors, rate limits, etc.)
 */

import { RetryConfig } from "../providers/types";

/**
 * Retries a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Result of successful function call
 * @throws Last error if all retries exhausted
 */
export async function retry<T>(
    fn: () => Promise<T>,
    config: RetryConfig
): Promise<T> {
    const { maxRetries, initialDelay, backoffMultiplier, maxDelay } = config;

    let lastError: Error | undefined;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // If this was the last attempt, throw
            if (attempt === maxRetries) {
                break;
            }

            // Wait before next retry
            await sleep(delay);

            // Increase delay with exponential backoff
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    throw lastError || new Error("Retry failed with unknown error");
}

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Predefined retry configs for common use cases
 */
export const RETRY_PRESETS = {
    /** Default: 3 retries, 1s initial, 2x multiplier, 10s max */
    default: {
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        maxDelay: 10000,
    },
    /** Aggressive: 5 retries, 500ms initial, 2x multiplier, 30s max */
    aggressive: {
        maxRetries: 5,
        initialDelay: 500,
        backoffMultiplier: 2,
        maxDelay: 30000,
    },
    /** Conservative: 2 retries, 2s initial, 3x multiplier, 20s max */
    conservative: {
        maxRetries: 2,
        initialDelay: 2000,
        backoffMultiplier: 3,
        maxDelay: 20000,
    },
} as const;
