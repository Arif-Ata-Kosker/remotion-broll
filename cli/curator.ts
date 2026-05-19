import * as fs from "fs";
import * as path from "path";
import chalk from "./logger";
import { z } from "zod";
import {
    AICompletionProvider,
    StockVideoProvider,
    VideoGenerationProvider,
} from "./providers";

// Strategy Definition
const AssetStrategySchema = z.object({
    strategy: z.enum(["USER_ASSET", "STOCK_ASSET", "GENERATIVE_ASSET"]),
    reasoning: z.string().describe("Why this strategy was chosen"),
    visualPrompt: z.string().describe("The specific visual description to search for or generate. E.g. 'Cinematic hourglass timelapse'"),
    filenameSuggestion: z.string().describe("Suggested filename for the asset (e.g. 'hourglass_timelapse.mp4')"),
    isAbstratOrGeneric: z.boolean().describe("True if the concept is generic (Love, Time), False if specific (My Screen, My Dog)"),
});

type AssetStrategy = z.infer<typeof AssetStrategySchema>;

// Configuration Interface
interface CuratorOptions {
    timelinePath: string;
    aiProvider: AICompletionProvider;
    stockProvider: StockVideoProvider;
    videoProvider: VideoGenerationProvider;
}

// Helper: Download File
async function downloadFile(url: string, destPath: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
}

export async function enrichTimeline(options: CuratorOptions) {
    console.log(chalk.blue("🧠 Starting AI Director (Smart Curator)..."));

    const timelinePath = options.timelinePath;
    if (!fs.existsSync(timelinePath)) {
        throw new Error(`Timeline not found at ${timelinePath}`);
    }

    const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
    const segments = timeline.segments;

    // Ensure assets directory exists
    // timeline.videoSrc is "brol-video.mp4". 
    // We want "public/content/n8n-automation/broll".
    // Let's derive it from timeline info or hardcode for this project structure.
    const projectShortName = timeline.shortTitle || "default";
    const assetsDir = path.join("public", "content", projectShortName, "broll");
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    console.log(chalk.blue(`   Analyzing ${segments.length} segments with AI...`));

    let updatedCount = 0;

    for (const segment of segments) {
        if (!segment.text) continue;

        // COST OPTIMIZATION: Skip if we already have a valid asset AND IT EXISTS ON DISK
        const brollPath = segment.broll?.src ? path.join("public", segment.broll.src) : null;
        const assetExists = brollPath ? fs.existsSync(brollPath) : false;

        if (segment.broll && segment.broll.src &&
            !segment.broll.src.startsWith("STOCK_NOT_FOUND") &&
            !segment.broll.src.startsWith("GEN_AI_FAILED") &&
            !segment.broll.src.startsWith("MISSING") &&
            assetExists
        ) {
            console.log(chalk.gray(`   ⏩ Skipping Segment ${segment.id} (Existing Asset): ${segment.broll.src}`));
            continue;
        }

        console.log(chalk.yellow(`\n   🎬 Segment ${segment.id}: "${segment.text.substring(0, 40)}..."`));

        try {
            // 1. Decide Strategy
            let decision: AssetStrategy;
            try {
                decision = await analyzeSegment(segment.text, options.aiProvider);
            } catch (aiErr) {
                console.warn(chalk.yellow(`      ⚠️ AI Analysis Failed, falling back to Keyword Search: ${aiErr}`));
                // Fallback: Use text as visual prompt for stock
                decision = {
                    strategy: "STOCK_ASSET",
                    visualPrompt: segment.text, // Use raw text or simplified
                    filenameSuggestion: `fallback_${segment.id}`,
                    reasoning: "AI API Failed, using keyword search fallback.",
                    isAbstratOrGeneric: true
                };
            }

            console.log(chalk.gray(`      Strategy: ${decision.strategy}`));
            console.log(chalk.gray(`      Visual:   ${decision.visualPrompt}`));

            let safeFilename = (decision.filenameSuggestion || `seg_${segment.id}_asset.mp4`)
                .replace(/[^a-z0-9.]/gi, "_").toLowerCase();
            if (!safeFilename.endsWith(".mp4")) safeFilename += ".mp4";

            const localDestPath = path.join(assetsDir, safeFilename);
            const relativePath = `content/${projectShortName}/broll/${safeFilename}`;

            // 2. Execute Strategy
            if (decision.strategy === "USER_ASSET") {
                console.log(chalk.red(`      🛑 USER ASSET REQUIRED: ${decision.filenameSuggestion}`));
                segment.broll = {
                    src: `MISSING_USER_ASSET_${decision.filenameSuggestion}`,
                    type: "video"
                };
            }
            else if (decision.strategy === "STOCK_ASSET") {
                console.log(chalk.yellow(`   🔍 Stock Search (Pexels): "${decision.visualPrompt}"`));

                const stockUrl = await options.stockProvider.search(decision.visualPrompt);
                if (stockUrl) {
                    console.log(chalk.green(`      ⬇️ Downloading Stock: ${stockUrl.substring(0, 50)}...`));
                    try {
                        await downloadFile(stockUrl, localDestPath);
                        console.log(chalk.green(`      ✅ Saved to: ${relativePath}`));
                        segment.broll = { src: relativePath, type: "video" };
                    } catch (dlErr) {
                        console.error(chalk.red(`      ❌ Download Failed: ${dlErr}`));
                    }
                } else {
                    console.log(chalk.red(`      ❌ Stock Not Found`));
                    segment.broll = { src: `STOCK_NOT_FOUND: ${decision.visualPrompt}`, type: "video" };
                }
            }
            else {
                // Generative
                console.log(chalk.magenta(`      ✨ Generative Candidate: ${decision.visualPrompt}`));
                try {
                    const videoUrl = await options.videoProvider.generateVideo(decision.visualPrompt);

                    console.log(chalk.green(`      ⬇️ Downloading Gen Video: ${videoUrl}`));
                    await downloadFile(videoUrl, localDestPath);
                    console.log(chalk.green(`      ✅ Saved to: ${relativePath}`));

                    segment.broll = {
                        src: relativePath,
                        type: "video"
                    };
                } catch (e: any) {
                    console.error(chalk.red(`      ❌ Generation Failed: ${e.message}`));
                    segment.broll = {
                        src: `GEN_AI_FAILED: ${e.message} || ${decision.visualPrompt}`,
                        type: "video"
                    };
                }
            }

            updatedCount++;

        } catch (e) {
            console.error(chalk.red(`      Error analyzing segment: ${e}`));
        }
    }

    // Write back
    fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2));
    console.log(chalk.green(`\n✅ Director finished. Analyzed ${updatedCount} segments.`));
    console.log(chalk.green("   (Timeline updated successfully)"));
}

async function analyzeSegment(text: string, aiProvider: AICompletionProvider): Promise<AssetStrategy> {
    const prompt = `
    You are a Video Director. Analyze the following script segment and decide how to visualize it with B-Roll.

    Script: "${text}"

    Rules:
    1. USER_ASSET: If the text mentions specific real-world objects the user has (e.g. "My screen", "This notion template", "My earnings", "Me walking"), choose this. We cannot generate or stock this.
    2. STOCK_ASSET: If the concept is generic (e.g. "Time passing", "Money", "Stress", "Office work"), choose this. We can find this on Pexels.
    3. GENERATIVE_ASSET: If it's abstract, sci-fi, or impossible to film (e.g. "A city made of gold", "Cyberpunk robot"), choose this.

    Output a specific 'visualPrompt' optimized for a search engine or video generator.
    Examples:
    - Text: "Time is money" -> Visual: "Hourglass sand falling cinematic lighting"
    - Text: "I built this automation" -> Visual: "Close up hands typing on backlit keyboard coding" (Generic enough) OR "Screen recording of specific automation" (User Asset if implied specific).
  `;

    return aiProvider.complete(prompt, AssetStrategySchema);
}
