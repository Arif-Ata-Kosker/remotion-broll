import { LayoutType } from "../src/lib/types";

export interface ScriptSegment {
    name: string;
    text: string;
    layout: LayoutType;
    sentenceCount: number;
}

/**
 * Splits text into sentences and groups them according to the Dynamic Template Rules.
 * Rules:
 * - HOOK: 1st sentence -> split-40-60
 * - BODY LOOP: Groups of 2 sentences -> [fullscreen-asset, closeup, split-60-40]
 * - CTA: Last 1-3 sentences -> closeup-cta
 */
export function segmentScript(fullText: string): ScriptSegment[] {
    // 1. Split into sentences (Basic regex, can be improved)
    // Match punctuation followed by space or end of string
    const sentences = fullText
        .replace(/([.!?])\s*(?=[A-ZÖÇŞİĞÜ])/g, "$1|")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const segments: ScriptSegment[] = [];

    if (sentences.length === 0) return [];

    // 2. Identify HOOK (Sentence 0)
    segments.push({
        name: "Hook",
        text: sentences[0],
        layout: "split-40-60",
        sentenceCount: 1,
    });

    // 3. Identify CTA (Last 1 to 3 sentences)
    // We need to reserve sentences for CTA first to know where the Body ends.
    // Rule says "1-3 sentences". Let's say if we have enough sentences, take last 2.
    // If we only have 2 sentences total (Hook + CTA), take 1.

    let ctaSentenceCount = 2;
    const remainingAfterHook = sentences.length - 1;

    if (remainingAfterHook <= 0) {
        // Only hook exists? Handle gracefully
        return segments;
    }

    if (remainingAfterHook <= 2) {
        ctaSentenceCount = remainingAfterHook; // Take all remaining
    }

    // Indices for Body
    const bodyStartIndex = 1;
    const bodyEndIndex = sentences.length - ctaSentenceCount;

    // 4. Loop Body
    const bodySentences = sentences.slice(bodyStartIndex, bodyEndIndex);

    // Group by 2
    let loopIndex = 0;
    for (let i = 0; i < bodySentences.length; i += 2) {
        // Get chunk of 2 sentences (or 1 if odd number at end of body)
        const chunk = bodySentences.slice(i, i + 2);
        const text = chunk.join(" ");
        const segNum = (loopIndex % 3) + 1; // 1, 2, 3

        let layout: LayoutType = "fullscreen-asset"; // Default Seg 1
        if (segNum === 2) layout = "closeup";
        if (segNum === 3) layout = "split-60-40";

        segments.push({
            name: `Segment ${segments.length} (Body ${segNum})`,
            text: text,
            layout: layout,
            sentenceCount: chunk.length
        });

        loopIndex++;
    }

    // 5. Add CTA
    const ctaText = sentences.slice(bodyEndIndex).join(" ");
    segments.push({
        name: "CTA",
        text: ctaText,
        layout: "closeup-cta",
        sentenceCount: ctaSentenceCount
    });

    return segments;
}
