// Basic Pexels Search via Fetch

// We need to install pexels or use fetch. Pexels package is simple wrapper.
// Let's use fetch to avoid dependency if not installed, or check package.json.
// User didn't say to install pexels package. Fetch is safer.

export async function searchPexelsVideo(query: string, apiKey?: string): Promise<string | null> {
    const key = apiKey || process.env.PEXELS_API_KEY;
    if (!key) {
        console.warn("   ⚠️ No Pexels API Key found.");
        return null;
    }

    try {
        const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait&size=medium`;

        const res = await fetch(url, {
            headers: {
                Authorization: key
            }
        });

        if (!res.ok) {
            console.error(`Pexels Error: ${res.status} ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
            const video = data.videos[0];
            // Find best quality link (HD, portrait)
            const videoFiles = video.video_files;
            // Prefer HD
            const bestFile = videoFiles.find((f: any) => f.height >= 1080) || videoFiles[0];
            return bestFile.link;
        }

        return null;

    } catch (e) {
        console.error("Pexels Search Failed:", e);
        return null;
    }
}
