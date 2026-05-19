import z from "zod";
import chalk from "./logger";

// Removed zod-to-json-schema to fix CLI crash

let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
};

const KIE_POLL_INTERVAL = 2000;
const KIE_MAX_RETRIES = 120;

// Helper: Kie.ai Chat Completion (via Job/Task)
export async function kieAiCompletion<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: { baseUrl: string; apiKey: string; model: string }
): Promise<T> {
  // Kie.ai uses /jobs/createTask for everything, even LLM chat
  const payload = {
    model: options.model,
    input: {
      messages: [
        { role: "user", content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON." }
      ]
    }
  };

  console.log(chalk.gray(`   🧠 Sending Query to ${options.model} (via Task)...`));

  const createRes = await fetch(`${options.baseUrl}/jobs/createTask`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const txt = await createRes.text();
    throw new Error(`Kie.ai Task Failed: ${createRes.status} ${txt}`);
  }

  const createData = await createRes.json();
  const taskId = createData.data?.taskId || createData.data?.task_id;

  if (!taskId) throw new Error(`Kie.ai no taskId: ${JSON.stringify(createData)}`);

  console.log(chalk.gray(`   ⏳ Director Analysis Task: ${taskId}`));

  // Poll for result
  for (let i = 0; i < KIE_MAX_RETRIES; i++) {
    await new Promise(r => setTimeout(r, KIE_POLL_INTERVAL));
    const pollRes = await fetch(`${options.baseUrl}/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${options.apiKey}` }
    });
    if (!pollRes.ok) continue;

    const pollData = await pollRes.json();
    const state = pollData.data?.state;

    if (state === "success") {
      const resultText = pollData.data?.result || pollData.data?.response || pollData.data?.resultJson;
      try {
        const clean = typeof resultText === 'string' ? resultText.replace(/```json/g, "").replace(/```/g, "").trim() : JSON.stringify(resultText);
        const json = JSON.parse(clean);
        return json as T;
      } catch (e) {
        if (typeof resultText === 'object') return resultText as T;
        throw new Error(`Failed to parse Kie.ai result: ${JSON.stringify(resultText)}`);
      }
    }
    if (state === "fail") throw new Error(`Kie.ai Task Failed: ${pollData.data?.failMsg}`);
  }
  throw new Error("Kie.ai Director Timeout");
}

export async function generateVideoAsset(
  prompt: string,
  options: { baseUrl?: string; apiKey?: string; model?: string } = {}
): Promise<string> {
  const baseUrl = options.baseUrl || process.env.KIE_AI_BASE_URL || "https://api.kie.ai/api/v1";
  const apiKey = options.apiKey || process.env.KIE_AI_API_KEY;
  const model = options.model || "grok-imagine/text-to-video";

  if (!apiKey) throw new Error("API Key required for video generation");

  // User's CURL Structure
  const payload = {
    model: model,
    callBackUrl: "https://example.com/callback", // Dummy, likely ignored or optional if polling
    input: {
      prompt: prompt,
      aspect_ratio: "9:16", // Vertical for Reels
      mode: "normal",
      duration: "6"
    }
  };

  console.log(chalk.blue(`   🎥 Generating video (${model})...`));
  console.log(chalk.gray(`      URL: ${baseUrl}/jobs/createTask`));
  // console.log(chalk.gray(`      Payload: ${JSON.stringify(payload)}`));

  const createRes = await fetch(`${baseUrl}/jobs/createTask`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const txt = await createRes.text();
    throw new Error(`Video Gen Failed: ${createRes.status} ${txt}`);
  }

  const createData = await createRes.json();
  const taskId = createData.data?.taskId || createData.data?.task_id;
  if (!taskId) throw new Error(`No taskId from video gen: ${JSON.stringify(createData)}`);

  console.log(chalk.gray(`      Task ID: ${taskId} (Polling...)`));

  // Poll for result
  for (let i = 0; i < 300; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const pollRes = await fetch(`${baseUrl}/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    if (!pollRes.ok) continue;

    const pollData = await pollRes.json();
    const state = pollData.data?.state;

    if (state === "success") {
      try {
        // Result can be in resultJson or result properties
        const resultObj = pollData.data?.resultJson ? JSON.parse(pollData.data.resultJson) : pollData.data;

        // Check various URL locations in result
        const videoUrl = resultObj.resultUrls?.[0] || resultObj.video_url || resultObj.url || resultObj.output?.[0] || pollData.data?.resultUrls?.[0];

        if (videoUrl) return videoUrl;

        console.error("❌ No URL found in success response. Dump:", JSON.stringify(pollData, null, 2));
        throw new Error("No URL found in success response");

        console.warn("Full Poll Data:", JSON.stringify(pollData, null, 2));
        throw new Error("No URL found in success response");
      } catch (e: any) {
        throw new Error(`Failed to parse video result: ${e.message}`);
      }
    }

    if (state === "fail") {
      throw new Error(`Video Gen Failed: ${pollData.data?.failMsg}`);
    }
  }
  throw new Error("Video Gen Timeout");
}

export const openaiStructuredCompletion = async <T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
  } = {}
): Promise<T> => {
  // Standard OpenAI Branch (GPT-4o, etc.)
  const openAiKey = options.apiKey || apiKey || process.env.OPENAI_API_KEY;
  if (!openAiKey) throw new Error("OpenAI API Key required for standard model.");

  const url = "https://api.openai.com/v1/chat/completions";

  console.log(chalk.blue(`   🧠 Director (OpenAI): Sending Query to ${options.model || "gpt-4o"}...`));

  const payload = {
    model: options.model || "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant. Return ONLY valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI Failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  try {
    const clean = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(clean);
    return json as T;
  } catch (e) {
    throw new Error(`Failed to parse OpenAI JSON: ${content}`);
  }
};

// ... unused image generation, skipping or minimal stub ...

export const getGenerateStoryPrompt = (title: string, topic: string) => {
  return ""; // Stub
};

export const getGenerateImageDescriptionPrompt = (storyText: string) => {
  return ""; // Stub
}

export const generateAiImage = async (params: any) => {
  // Stub
}

export const generateVoice = async (
  text: string,
  apiKey: string,
  path: string,
): Promise<any> => {
  console.log(chalk.yellow("Speech generation disabled (ElevenLabs dependency removed)."));
  return {
    characters: [],
    characterStartTimesSeconds: [],
    characterEndTimesSeconds: []
  };
};

export const transcribeAudio = async (
  filePath: string,
  apiKey: string,
): Promise<{
  text: string;
  segments: { id: number; start: number; end: number; text: string; }[];
  words: { word: string; start: number; end: number; }[];
}> => {
  // Basic Stub for enrich context (recut not needed)
  return { text: "", segments: [], words: [] };
};
