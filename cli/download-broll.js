// B-Roll video indirme scripti (Pexels API)
const https = require('https');
const fs = require('fs');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
    console.error('PEXELS_API_KEY env var is required. See .env.example.');
    process.exit(1);
}

const BROLL_DIR = path.join(__dirname, '../public/content/n8n-automation/broll');

// Segment bazlı B-Roll arama terimleri
const BROLL_QUERIES = [
    { id: 1, query: 'artificial intelligence robot', filename: 'ai-robot.mp4' },
    { id: 2, query: 'phone call notification', filename: 'phone-call.mp4' },
    { id: 3, query: 'money saving piggy bank', filename: 'money-saving.mp4' },
    { id: 4, query: 'office stress busy', filename: 'office-stress.mp4' },
    { id: 5, query: 'success checkmark green', filename: 'success.mp4' },
    { id: 6, query: 'computer workflow automation', filename: 'workflow.mp4' },
    { id: 7, query: 'youtube subscribe button', filename: 'youtube-cta.mp4' },
];

// Pexels API'den video ara
async function searchPexelsVideo(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`,
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.videos && json.videos.length > 0) {
                        // En küçük boyutlu HD video dosyasını seç
                        const video = json.videos[0];
                        const videoFile = video.video_files.find(f => f.quality === 'hd' && f.width <= 1080)
                            || video.video_files[0];
                        resolve(videoFile.link);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Video indir
async function downloadVideo(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        const download = (downloadUrl) => {
            https.get(downloadUrl, (res) => {
                if (res.statusCode === 302 || res.statusCode === 301) {
                    download(res.headers.location);
                    return;
                }
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        };

        download(url);
    });
}

async function main() {
    // B-Roll klasörünü oluştur
    if (!fs.existsSync(BROLL_DIR)) {
        fs.mkdirSync(BROLL_DIR, { recursive: true });
    }

    console.log('🎬 B-Roll videoları indiriliyor...\n');

    for (const broll of BROLL_QUERIES) {
        const filepath = path.join(BROLL_DIR, broll.filename);

        // Zaten varsa atla
        if (fs.existsSync(filepath)) {
            console.log(`✅ ${broll.filename} zaten mevcut, atlaniyor`);
            continue;
        }

        console.log(`🔍 Segment ${broll.id}: "${broll.query}" araniyor...`);

        try {
            const videoUrl = await searchPexelsVideo(broll.query);

            if (videoUrl) {
                console.log(`⬇️  İndiriliyor: ${broll.filename}`);
                await downloadVideo(videoUrl, filepath);
                console.log(`✅ ${broll.filename} indirildi!\n`);
            } else {
                console.log(`❌ "${broll.query}" için video bulunamadı\n`);
            }
        } catch (error) {
            console.error(`❌ Hata: ${error.message}\n`);
        }

        // Rate limiting için bekle
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n🎉 B-Roll indirme tamamlandı!');
}

main().catch(console.error);
