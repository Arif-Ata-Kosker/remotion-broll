#!/usr/bin/env node

import yargs from "yargs";

import prompts from "prompts";
// import ora from "ora"; // Internal dependency on chalk causes ESM issues using native console instead
import chalk from "./logger";
import * as dotenv from "dotenv";
import {
  generateAiImage,
  generateVoice,
  getGenerateImageDescriptionPrompt,
  getGenerateStoryPrompt,
  openaiStructuredCompletion,
  setApiKey,
} from "./service_v2";
import {
  ContentItemWithDetails,
  StoryMetadataWithDetails,
  StoryScript,
  StoryWithImages,
  Timeline,
} from "../src/lib/types";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import { createTimeLineFromStoryWithDetails } from "./timeline";
import { enrichTimeline } from "./curator";
import { OpenAIProvider } from "./providers/openai";
import { KieAiProvider } from "./providers/kie-ai";
import { PexelsProvider } from "./providers/pexels";
import { recutVideo } from "./recut";
import { detectFaceCommand } from "./commands/detect-face";


dotenv.config({ quiet: true });

interface GenerateOptions {
  apiKey?: string;
  elevenlabsApiKey?: string;
  title?: string;
  topic?: string;
}

class ContentFS {
  title: string;
  slug: string;

  constructor(title: string) {
    this.title = title;
    this.slug = this.getSlug();
  }

  saveDescriptor(descriptor: StoryMetadataWithDetails) {
    const dirPath = this.getDir();
    const filePath = path.join(dirPath, "descriptor.json");
    fs.writeFileSync(filePath, JSON.stringify(descriptor, null, 2));
  }

  saveTimeline(timeline: Timeline) {
    const dirPath = this.getDir();
    const filePath = path.join(dirPath, "timeline.json");
    fs.writeFileSync(filePath, JSON.stringify(timeline, null, 2));
  }

  getDir(dir?: string): string {
    const segments = ["public", "content", this.slug];
    if (dir) {
      segments.push(dir);
    }
    const p = path.join(process.cwd(), ...segments);
    fs.mkdirSync(p, { recursive: true });
    return p;
  }

  getImagePath(uid: string): string {
    const dirPath = this.getDir("images");
    return path.join(dirPath, `${uid}.png`);
  }

  getAudioPath(uid: string): string {
    const dirPath = this.getDir("audio");
    return path.join(dirPath, `${uid}.mp3`);
  }

  getSlug(): string {
    return this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

async function generateStory(options: GenerateOptions) {
  try {
    let apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    let elevenlabsApiKey =
      options.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      const response = await prompts({
        type: "password",
        name: "apiKey",
        message: "Enter your OpenAI API key:",
        validate: (value) => value.length > 0 || "API key is required",
      });

      if (!response.apiKey) {
        console.log(chalk.red("API key is required. Exiting..."));
        process.exit(1);
      }

      apiKey = response.apiKey;
    }

    if (!elevenlabsApiKey) {
      const response = await prompts({
        type: "password",
        name: "elevenlabsApiKey",
        message: "Enter your ElevenLabs API key:",
        validate: (value) =>
          value.length > 0 || "ElevenLabs API key is required",
      });

      if (!response.elevenlabsApiKey) {
        console.log(chalk.red("API key is required. Exiting..."));
        process.exit(1);
      }

      elevenlabsApiKey = response.elevenlabsApiKey;
    }

    let { title, topic } = options;

    if (!title || !topic) {
      const response = await prompts([
        {
          type: "text",
          name: "title",
          message: "Title of the story:",
          initial: title,
          validate: (value) => value.length > 0 || "Title is required",
        },
        {
          type: "text",
          name: "topic",
          message: "Topic of the story:",
          initial: topic,
          validate: (value) => value.length > 0 || "Topic is required",
        },
      ]);

      if (!response.title || !response.topic) {
        console.log(chalk.red("Title and topic are required. Exiting..."));
        process.exit(1);
      }

      title = response.title;
      topic = response.topic;
    }

    console.log(chalk.blue(`\n📖 Creating story: "${title}"`));
    console.log(chalk.blue(`📝 Topic: ${topic}\n`));

    const storyWithDetails: StoryMetadataWithDetails = {
      shortTitle: title!,
      content: [],
    };

    console.log("Generating story...");
    setApiKey(apiKey!);
    const storyRes = await openaiStructuredCompletion(
      getGenerateStoryPrompt(title!, topic!),
      StoryScript,
    );
    console.log(chalk.green("Story generated!"));

    console.log("Generating image descriptions...");
    const storyWithImagesRes = await openaiStructuredCompletion(
      getGenerateImageDescriptionPrompt(storyRes.text),
      StoryWithImages,
    );
    console.log(chalk.green("Image descriptions generated!"));

    for (const item of storyWithImagesRes.result) {
      const contentWithDetails: ContentItemWithDetails = {
        text: item.text,
        imageDescription: item.imageDescription,
        uid: uuidv4(),
        audioTimestamps: {
          characters: [],
          characterStartTimesSeconds: [],
          characterEndTimesSeconds: [],
        },
      };

      storyWithDetails.content.push(contentWithDetails);
    }

    console.log("Generating images and voice...");
    const contentFs = new ContentFS(title!);
    contentFs.saveDescriptor(storyWithDetails);

    for (let i = 0; i < storyWithDetails.content.length; i++) {
      const storyItem = storyWithDetails.content[i];
      console.log(`[${i * 2 + 1}/${storyWithDetails.content.length * 2}] Generating image for ${storyItem.text}`);
      await generateAiImage({
        prompt: storyItem.imageDescription,
        path: contentFs.getImagePath(storyItem.uid),
        onRetry: (attempt: number) => {
          console.log(`[${i * 2 + 1}/${storyWithDetails.content.length * 2}] Generating image for ${storyItem.text} (retry ${attempt + 1})`);
        },
      });
      console.log(`[${i * 2 + 2}/${storyWithDetails.content.length * 2}] Generating voice for ${storyItem.text}`);
      const timings = await generateVoice(
        storyItem.text,
        elevenlabsApiKey!,
        contentFs.getAudioPath(storyItem.uid),
      );
      storyItem.audioTimestamps = timings;
    }
    contentFs.saveDescriptor(storyWithDetails);
    console.log(chalk.green("Images generated!"));

    console.log("Generating final result...");
    const timeline = createTimeLineFromStoryWithDetails(storyWithDetails);
    contentFs.saveTimeline(timeline);
    console.log(chalk.green("Final result generated!"));

    console.log(chalk.green("\n✨ Story generation complete!\n"));
    console.log("Run " + chalk.blue("npm run dev") + " to preview the story");

    return {};
  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error);
    process.exit(1);
  }
}

yargs(process.argv.slice(2))
  .command(
    "generate",
    "Generate story timeline for given title and topic",
    (yargs) => {
      return yargs
        .option("api-key", {
          alias: "k",
          type: "string",
          description: "OpenAI API key",
        })
        .option("title", {
          alias: "t",
          type: "string",
          description: "Title of the story",
        })
        .option("topic", {
          alias: "p",
          type: "string",
          description:
            "Topic of the story (e.g. Interesting Facts, History, etc.)",
        });
    },
    async (argv) => {
      await generateStory({
        apiKey: argv["api-key"],
        title: argv.title,
        topic: argv.topic,
      });
    },
  )
  .command(
    "$0",
    "Generate a story (default command)",
    (yargs) => {
      return yargs
        .option("api-key", {
          alias: "k",
          type: "string",
          description: "OpenAI API key",
        })
        .option("title", {
          alias: "t",
          type: "string",
          description: "Title of the story",
        })
        .option("topic", {
          alias: "p",
          type: "string",
          description:
            "Topic of the story (e.g. Interesting Facts, History, etc.)",
        });
    },
    async (argv) => {
      await generateStory({
        apiKey: argv["api-key"],
        title: argv.title,
        topic: argv.topic,
      });
    },
  )
  .command(
    "recut",
    "Recut an existing video based on a script",
    (yargs) => {
      return yargs
        .option("api-key", {
          alias: "k",
          type: "string",
          description: "OpenAI API key",
        })
        .option("video", {
          alias: "i",
          type: "string",
          description: "Input video path",
          default: "public/brol-video.mp4",
        })
        .option("file", {
          alias: "f",
          type: "string",
          description: "Script file path",
          default: "script.txt",
        });
    },
    async (argv) => {
      let apiKey = argv["api-key"] || process.env.OPENAI_API_KEY;

      if (!apiKey) {
        const response = await prompts({
          type: "password",
          name: "apiKey",
          message: "Enter your OpenAI API key:",
          validate: (value) => value.length > 0 || "API key is required",
        });
        apiKey = response.apiKey;
      }

      if (!apiKey) {
        console.error("API key is required");
        process.exit(1);
      }

      await recutVideo({
        videoPath: argv.video as string,
        scriptPath: argv.file as string,
        apiKey: apiKey!,
      });
    },
  )
  .command(
    "enrich",
    "Enrich timeline with Smart Asset Selection (AI Director)",
    (yargs) => {
      return yargs
        .option("api-key", {
          alias: "k",
          type: "string",
          description: "AI API key (OpenAI or compatible)",
        })
        .option("base-url", {
          type: "string",
          description: "Custom AI Base URL (e.g. for kie.ai)",
        })
        .option("model", {
          type: "string",
          description: "Model name to use (e.g. cheapest-model)",
          default: "gpt-4-turbo",
        })
        .option("timeline", {
          type: "string",
          description: "Path to timeline.json",
          default: "public/content/n8n-automation/timeline.json",
        });
    },
    async (argv) => {
      let apiKey = argv["api-key"] || process.env.OPENAI_API_KEY || process.env.KIE_AI_API_KEY;

      if (!apiKey) {
        const response = await prompts({
          type: "password",
          name: "apiKey",
          message: "Enter your AI API key:",
          validate: (value) => value.length > 0 || "API key is required",
        });
        apiKey = response.apiKey;
      }

      if (!apiKey) {
        console.error("API key is required");
        process.exit(1);
      }

      const pexelsKey = process.env.PEXELS_API_KEY || "";
      const kieKey = process.env.KIE_AI_API_KEY || apiKey!;

      await enrichTimeline({
        timelinePath: argv.timeline as string,
        aiProvider: new OpenAIProvider(apiKey!),
        stockProvider: new PexelsProvider(pexelsKey),
        videoProvider: new KieAiProvider(kieKey),
      });
    },
  )
  .command(
    "detect-face",
    "Detect face position in video and inject crop data into timeline",
    (yargs) => {
      return yargs
        .option("video", {
          alias: "v",
          type: "string",
          description: "Input video path",
          default: "public/brol-video.mp4",
        })
        .option("timeline", {
          alias: "t",
          type: "string",
          description: "Path to timeline.json",
          demandOption: true,
        })
        .option("timestamp", {
          type: "number",
          description: "Timestamp (seconds) for face detection frame",
          default: 2.0,
        });
    },
    async (argv) => {
      await detectFaceCommand({
        videoPath: argv.video as string,
        timelinePath: argv.timeline as string,
        timestamp: argv.timestamp as number,
      });
    },
  )
  .demandCommand(0, 1)
  .help()
  .alias("help", "h")
  .version()
  .alias("version", "v")
  .strict()
  .parse();
