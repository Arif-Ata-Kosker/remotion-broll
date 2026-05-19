/**
 * Cümle bazlı video kesme scripti
 * sentence-segments.json'daki timestamp'lere göre keser
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VIDEO_PATH = path.join(__dirname, '../public/brol-video.mp4');
const SEGMENTS_PATH = path.join(__dirname, '../public/content/n8n-automation/sentence-segments.json');
const OUTPUT_DIR = path.join(__dirname, '../public/content/n8n-automation/segments');

async function main() {
    console.log('🎬 Cümle Bazlı Video Kesme Başlıyor...\n');

    // Eski segmentleri temizle
    if (fs.existsSync(OUTPUT_DIR)) {
        const oldFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mp4'));
        oldFiles.forEach(f => {
            fs.unlinkSync(path.join(OUTPUT_DIR, f));
            console.log(`🗑️ Silindi: ${f}`);
        });
        console.log('');
    } else {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Segment verilerini yükle
    const data = JSON.parse(fs.readFileSync(SEGMENTS_PATH, 'utf-8'));
    console.log(`📊 ${data.segments.length} segment bulundu\n`);

    // Her segmenti kes
    for (const segment of data.segments) {
        const outputPath = path.join(OUTPUT_DIR, `segment-${segment.id}.mp4`);

        const startSec = segment.startMs / 1000;
        const duration = segment.durationMs / 1000;

        console.log(`✂️ Segment ${segment.id}:`);
        console.log(`   Süre: ${startSec.toFixed(2)}s - ${(segment.endMs / 1000).toFixed(2)}s (${duration.toFixed(2)}s)`);
        console.log(`   "${segment.text.substring(0, 50)}..."`);

        try {
            // Keyframe'lere göre keserken -ss parametresini input'tan önce kullan
            execSync(
                `ffmpeg -y -ss ${startSec} -i "${VIDEO_PATH}" -t ${duration} -c:v libx264 -c:a aac -avoid_negative_ts 1 "${outputPath}"`,
                { stdio: 'pipe' }
            );

            const size = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
            console.log(`   ✅ Kaydedildi (${size} MB)\n`);
        } catch (error) {
            console.error(`   ❌ Hata!\n`);
        }
    }

    // Sonuçları göster
    console.log('\n📁 Oluşturulan dosyalar:');
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mp4'));
    let totalSize = 0;
    files.forEach(f => {
        const size = fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024 / 1024;
        totalSize += size;
        console.log(`   - ${f} (${size.toFixed(2)} MB)`);
    });
    console.log(`\n   Toplam: ${totalSize.toFixed(2)} MB`);

    console.log('\n🎉 Video bölme tamamlandı!');
}

main().catch(console.error);
