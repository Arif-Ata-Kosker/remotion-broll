/**
 * ContentFS - File system abstraction for content management
 * Handles directory structure and file paths for generated content
 */

import * as fs from "fs";
import * as path from "path";
import { StoryMetadataWithDetails, Timeline } from "../src/lib/types";

export class ContentFS {
    title: string;
    slug: string;

    constructor(title: string) {
        this.title = title;
        this.slug = this.getSlug();
    }

    /**
     * Saves story descriptor (metadata + content)
     */
    saveDescriptor(descriptor: StoryMetadataWithDetails) {
        const dirPath = this.getDir();
        const filePath = path.join(dirPath, "descriptor.json");
        fs.writeFileSync(filePath, JSON.stringify(descriptor, null, 2));
    }

    /**
     * Saves timeline JSON
     */
    saveTimeline(timeline: Timeline) {
        const dirPath = this.getDir();
        const filePath = path.join(dirPath, "timeline.json");
        fs.writeFileSync(filePath, JSON.stringify(timeline, null, 2));
    }

    /**
     * Gets content directory path (creates if not exists)
     */
    getDir(dir?: string): string {
        const segments = ["public", "content", this.slug];
        if (dir) {
            segments.push(dir);
        }
        const p = path.join(process.cwd(), ...segments);
        fs.mkdirSync(p, { recursive: true });
        return p;
    }

    /**
     * Gets image file path for given UID
     */
    getImagePath(uid: string): string {
        const dirPath = this.getDir("images");
        return path.join(dirPath, `${uid}.png`);
    }

    /**
     * Gets audio file path for given UID
     */
    getAudioPath(uid: string): string {
        const dirPath = this.getDir("audio");
        return path.join(dirPath, `${uid}.mp3`);
    }

    /**
     * Converts title to URL-safe slug
     */
    getSlug(): string {
        return this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
}
