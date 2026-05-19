/**
 * String utility functions for text processing
 */

/**
 * Calculates Levenshtein distance between two strings
 * Used for fuzzy text matching in transcript alignment
 */
export function levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Normalizes string for comparison
 * - Converts to lowercase
 * - Removes punctuation (keeps Turkish characters)
 * - Normalizes whitespace
 */
export function normalize(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
