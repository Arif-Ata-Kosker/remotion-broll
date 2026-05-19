import * as fs from "fs";
import * as path from "path";
import { transcribeAudio } from "./service_v2";
import chalk from "./logger";
import { execSync } from "child_process";

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
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

function normalize(str: string): string {
    return str.toLowerCase().replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, "").replace(/\s+/g, " ").trim();
}

interface ScriptSegment {
    name: string;
    text: string;
    // Properties from segmenter
    layout?: string;
    sentenceCount?: number;
    // Properties added by recut
    start?: number;
    end?: number;
    startIndexInTranscript?: number;
    filename?: string;
}

import { segmentScript } from "./segmenter";

// ... existing imports ...

export async function recutVideo(options: {
    videoPath: string;
    scriptPath: string;
    apiKey: string;
}) {
    console.log(chalk.blue("🎬 Starting video recutting process (Dynamic Template Engine)..."));

    // 1. Parse Script (Auto-Segmentation)
    const scriptContent = fs.readFileSync(options.scriptPath, "utf-8");

    // Cleaning: Remove old style tags if present to just get raw text, or just use as is if user removed tags
    // Let's rely on the segmenter handling the text. 
    // If the user pasted the old script with "-- HOOK", the robust regex might treat "-- HOOK" as part of sentence or punctuation.
    // Let's strip lines starting with "--" just in case.
    const cleanScript = scriptContent.replace(/^--.*$/gm, "").replace(/\r\n/g, "\n").trim();

    // Cast to local interface which includes optional timing fields
    const finalSegments = segmentScript(cleanScript) as ScriptSegment[];

    console.log(chalk.blue(`📝 Auto-segmented ${finalSegments.length} parts from script:`));
    finalSegments.forEach(s => console.log(`   - ${s.name} (${s.layout}): "${s.text.substring(0, 30)}..."`));


    // 2. Extract Audio (WAV for precision)
    const audioPath = path.join(path.dirname(options.videoPath), "temp_audio_recut.wav");

    // Always overwrite for CLI to be safe? Or check existence.
    // Let's safe overwrite.
    console.log(chalk.blue("🔊 Extracting audio (WAV)..."));
    execSync(`ffmpeg -y -i "${options.videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`, { stdio: 'ignore' });

    // 3. Transcribe
    console.log(chalk.blue("🧠 Transcribing audio..."));
    const transcript = await transcribeAudio(audioPath, options.apiKey);

    if (!transcript.words) {
        throw new Error("No word timestamps found. Whisper API update required?");
    }

    console.log(chalk.gray(`   Received ${transcript.words.length} words.`));

    // 4. Align
    console.log(chalk.blue("🔗 Aligning segments..."));

    const transcriptWords = transcript.words;
    let searchStartIndex = 0;

    for (let i = 0; i < finalSegments.length; i++) {
        const seg = finalSegments[i];
        const segText = normalize(seg.text);
        const segWordList = segText.split(" ");

        // Search window
        const anchorSize = Math.min(segWordList.length, 8);
        let bestIndex = -1;
        let maxScore = -1;

        for (let j = searchStartIndex; j < transcriptWords.length - anchorSize; j++) {
            let matches = 0;
            for (let k = 0; k < anchorSize; k++) {
                const tWord = normalize(transcriptWords[j + k].word);
                const sWord = segWordList[k];
                const dist = levenshtein(tWord, sWord);
                // Fuzzy threshold
                const threshold = Math.max(2, Math.floor(sWord.length * 0.4));
                if (dist <= threshold) matches++;
            }

            if (matches > maxScore) {
                maxScore = matches;
                bestIndex = j;
            }
        }

        if (bestIndex !== -1 && maxScore >= (anchorSize * 0.6)) {
            seg.start = transcriptWords[bestIndex].start;
            seg.startIndexInTranscript = bestIndex;
            searchStartIndex = bestIndex + Math.floor(segWordList.length * 0.5);
            console.log(chalk.green(`   Matched "${seg.name}" at ${seg.start?.toFixed(2)}s`));
        } else {
            console.warn(chalk.yellow(`   ⚠️ Weak/No match for "${seg.name}". Fallback.`));
            if (i === 0) seg.start = 0;
            else seg.start = finalSegments[i - 1].end || 0;
        }
    }

    // Resolve Ends with Silence Gap Detection
    for (let i = 0; i < finalSegments.length; i++) {
        const seg = finalSegments[i];

        if (i < finalSegments.length - 1) {
            const nextSeg = finalSegments[i + 1];

            if (nextSeg && nextSeg.startIndexInTranscript !== undefined && nextSeg.startIndexInTranscript > 0) {
                const nextStartIdx = nextSeg.startIndexInTranscript;
                const prevWordIdx = nextStartIdx - 1;

                if (prevWordIdx >= 0) {
                    const nextWord = transcriptWords[nextStartIdx];
                    const prevWord = transcriptWords[prevWordIdx];
                    const gap = nextWord.start - prevWord.end;

                    if (gap > 0) {
                        seg.end = prevWord.end + (gap / 2);
                        console.log(chalk.gray(`   Gap for Seg ${i + 1}/${i + 2}: |${gap.toFixed(3)}s|. Cut at ${seg.end?.toFixed(3)}s`));
                    } else {
                        seg.end = nextWord.start;
                    }
                } else {
                    seg.end = nextSeg.start;
                }
                nextSeg.start = seg.end;
            } else {
                seg.end = nextSeg.start || ((seg.start || 0) + 5);
            }
        } else {
            seg.end = transcriptWords[transcriptWords.length - 1].end;
        }

        if ((seg.end || 0) <= (seg.start || 0)) seg.end = (seg.start || 0) + 1.0;

        let filename = seg.name.toLowerCase().replace(/\s+/g, "_");
        if (filename.includes("hook")) filename = "hook";
        if (filename.includes("cta")) filename = "cta";
        seg.filename = filename + ".mp4";
    }

    // 5. Cut
    console.log(chalk.blue("✂️ Cutting video..."));
    const outputDir = path.join("public", "segments");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 0; i < finalSegments.length; i++) {
        const seg = finalSegments[i];
        if (seg.start !== undefined && seg.end !== undefined) {
            const duration = Math.max(0, seg.end - seg.start);
            const start = seg.start;
            const outputFile = path.join(outputDir, seg.filename || `seg_${i}.mp4`);

            console.log(`   ${seg.name} -> ${seg.filename}: ${start.toFixed(2)}s - ${seg.end.toFixed(2)}s (dur: ${duration.toFixed(2)}s)`);
            execSync(`ffmpeg -y -i "${options.videoPath}" -ss ${start.toFixed(3)} -t ${duration.toFixed(3)} -c:v libx264 -c:a aac "${outputFile}"`, { stdio: 'ignore' });
        }
    }

    console.log(chalk.green("✅ Video recutting complete! Check public/segments/"));

    // Cleanup temp audio
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
}
