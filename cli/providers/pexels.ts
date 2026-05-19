/**
 * Pexels Provider
 * Implements StockVideoProvider for stock video/image search
 */

import { StockVideoProvider } from "./types";
import { retry, RETRY_PRESETS } from "../utils/retry";

interface PexelsVideo {
    id: number;
    width: number;
    height: number;
    duration: number;
    video_files: Array<{
        id: number;
        quality: string;
        file_type: string;
        width: number;
        height: number;
        link: string;
    }>;
}

interface PexelsResponse {
    videos: PexelsVideo[];
    page: number;
    per_page: number;
    total_results: number;
}

export class PexelsProvider implements StockVideoProvider {
    private apiKey: string;
    private baseUrl = "https://api.pexels.com/videos";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Searches for stock video matching query
     * Returns URL to highest quality video
     */
    async search(query: string): Promise<string> {
        const searchFn = async () => {
            const response = await fetch(
                `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=15&orientation=portrait`,
                {
                    method: "GET",
                    headers: {
                        Authorization: this.apiKey,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Pexels API error: ${response.status} ${await response.text()}`);
            }

            const data: PexelsResponse = await response.json();

            if (!data.videos || data.videos.length === 0) {
                throw new Error(`No videos found for query: "${query}"`);
            }

            // Get first video and find best quality file
            const video = data.videos[0];
            const bestFile = this.getBestVideoFile(video);

            if (!bestFile) {
                throw new Error("No suitable video file found");
            }

            return bestFile.link;
        };

        return retry(searchFn, RETRY_PRESETS.default);
    }

    /**
     * Finds highest quality video file (prefers HD/FHD)
     */
    private getBestVideoFile(video: PexelsVideo) {
        const files = video.video_files;

        // Prefer HD or FHD
        const hd = files.find(
            (f) => f.quality === "hd" && f.width === 1080 && f.height === 1920
        );
        if (hd) return hd;

        // Fallback to highest resolution
        return files.reduce((best, current) => {
            if (!best) return current;
            return current.width * current.height > best.width * best.height
                ? current
                : best;
        }, files[0]);
    }
}
