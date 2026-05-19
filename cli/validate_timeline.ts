import fs from "fs";
import { ViralTimelineSchema } from "../src/lib/types";

const path = "public/content/n8n-automation/timeline.json";

function main() {
    console.log("Reading:", path);
    if (!fs.existsSync(path)) {
        console.error("File not found!");
        return;
    }
    const content = fs.readFileSync(path, "utf-8");
    try {
        const json = JSON.parse(content);
        console.log("JSON parsed. Validating Schema...");
        ViralTimelineSchema.parse(json);
        console.log("✅ Schema Validation Passed!");
        console.log("Segments:", json.segments?.length);
    } catch (e) {
        console.error("❌ Validation Failed:", e);
    }
}

main();
