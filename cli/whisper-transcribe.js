/**
 * OpenAI Whisper API ile videodan kelime bazlı timestamp çıkarma
 * MP4 dosyasını doğrudan Whisper API'ye gönderir (ffmpeg gerekmez)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

// .env dosyasını oku
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VIDEO_PATH = path.join(__dirname, '../public/brol-video.mp4');
const OUTPUT_PATH = path.join(__dirname, '../public/content/n8n-automation/timeline.json');

// Segment tanımları (B-Roll ile eşleştirilecek)
const SEGMENTS = [
    { id: 1, name: 'intro', brollSrc: 'content/n8n-automation/broll/ai-robot.mp4' },
    { id: 2, name: 'otomasyon-tanitim', brollSrc: 'content/n8n-automation/broll/phone-call.mp4' },
    { id: 3, name: 'ucretsiz-vurgusu', brollSrc: 'content/n8n-automation/broll/money-saving.mp4' },
    { id: 4, name: 'sirket-problemi', brollSrc: 'content/n8n-automation/broll/office-stress.mp4' },
    { id: 5, name: 'cozum-sunumu', brollSrc: 'content/n8n-automation/broll/success.mp4' },
    { id: 6, name: 'n8n-tanitimi', brollSrc: 'content/n8n-automation/broll/workflow.mp4' },
    { id: 7, name: 'cta-kapanis', brollSrc: 'content/n8n-automation/broll/youtube-cta.mp4' },
];

// Vurgulanacak kelimeler
const HIGHLIGHT_WORDS = [
    'yapay', 'zeka', 'otomasyon', 'ücretsiz', 'gerek', 'hazır', 'sistem',
    'yüzlerce', 'para', 'cevap', 'çözmüş', 'n8n', 'youtube', 'yorumlara'
];

async function transcribeWithWhisper() {
    console.log('� OpenAI Whisper API ile transkript alınıyor...');
    console.log('📁 Video dosyası:', VIDEO_PATH);
    console.log('📊 Dosya boyutu:', (fs.statSync(VIDEO_PATH).size / 1024 / 1024).toFixed(2), 'MB\n');

    const form = new FormData();
    form.append('file', fs.createReadStream(VIDEO_PATH));
    form.append('model', 'whisper-1');
    form.append('language', 'tr');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.openai.com',
            path: '/v1/audio/transcriptions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                ...form.getHeaders()
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.error) {
                        reject(new Error(result.error.message));
                    } else {
                        resolve(result);
                    }
                } catch (e) {
                    console.log('Raw response:', data.substring(0, 500));
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        form.pipe(req);
    });
}

function shouldHighlight(text) {
    const lowerText = text.toLowerCase();
    return HIGHLIGHT_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

function groupWordsIntoSubtitles(words) {
    // Kelimeleri 2-3 kelimelik gruplar halinde birleştir
    const subtitles = [];
    let currentGroup = [];
    let groupStartMs = 0;
    let lastEndMs = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (currentGroup.length === 0) {
            groupStartMs = Math.floor(word.start * 1000);
        }

        currentGroup.push(word.word);
        lastEndMs = Math.floor(word.end * 1000);

        // Grup 2-3 kelimeye ulaştığında veya noktalama varsa böl
        const shouldSplit = currentGroup.length >= 2 ||
            /[.!?,]$/.test(word.word) ||
            i === words.length - 1;

        if (shouldSplit && currentGroup.length > 0) {
            const text = currentGroup.join(' ').trim();

            subtitles.push({
                startMs: groupStartMs,
                endMs: lastEndMs,
                text: text,
                highlight: shouldHighlight(text)
            });

            currentGroup = [];
        }
    }

    return subtitles;
}

function assignSubtitlesToSegments(subtitles, totalDuration) {
    // Subtitle'ları segmentlere dengeli dağıt
    const segmentDuration = totalDuration / SEGMENTS.length;

    return SEGMENTS.map((segment, index) => {
        const segmentStartMs = Math.floor(index * segmentDuration);
        const segmentEndMs = Math.floor((index + 1) * segmentDuration);

        // Bu segment aralığındaki subtitle'ları filtrele
        const segmentSubtitles = subtitles.filter(sub =>
            sub.startMs >= segmentStartMs && sub.startMs < segmentEndMs
        );

        // SFX trigger noktaları - highlight olan kelimeler
        const sfx = segmentSubtitles
            .filter(sub => sub.highlight)
            .slice(0, 2) // Her segment için max 2 SFX
            .map((sub, i) => ({
                triggerMs: sub.startMs,
                file: i === 0 ? 'pop.mp3' : 'whoosh.mp3',
                volume: 0.5
            }));

        return {
            id: segment.id,
            name: segment.name,
            startMs: segmentStartMs,
            endMs: segmentEndMs,
            layout: 'split',
            broll: {
                src: segment.brollSrc,
                type: 'video'
            },
            subtitles: segmentSubtitles,
            sfx: sfx
        };
    });
}

async function main() {
    console.log('🚀 Whisper Transkripsiyon Başlıyor...\n');

    if (!OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY bulunamadı! .env dosyasını kontrol edin.');
        process.exit(1);
    }

    if (!fs.existsSync(VIDEO_PATH)) {
        console.error('❌ Video dosyası bulunamadı:', VIDEO_PATH);
        process.exit(1);
    }

    try {
        // Whisper ile transkript al
        const whisperResult = await transcribeWithWhisper();
        console.log('✅ Whisper transkript alındı!\n');
        console.log(`📝 Tam metin: "${whisperResult.text?.substring(0, 100)}..."\n`);
        console.log(`� Toplam kelime sayısı: ${whisperResult.words?.length || 0}`);
        console.log(`⏱️ Toplam süre: ${whisperResult.duration?.toFixed(2)} saniye\n`);

        if (!whisperResult.words || whisperResult.words.length === 0) {
            console.error('❌ Kelime timestamp\'leri alınamadı!');
            console.log('Fallback: Segment tabanlı timeline kullanılıyor...');
            process.exit(1);
        }

        // Kelimeleri subtitle gruplarına dönüştür
        const subtitles = groupWordsIntoSubtitles(whisperResult.words);
        console.log(`📊 Oluşturulan subtitle sayısı: ${subtitles.length}\n`);

        // Segmentlere dağıt
        const totalDurationMs = Math.floor(whisperResult.duration * 1000);
        const segments = assignSubtitlesToSegments(subtitles, totalDurationMs);

        // Timeline JSON oluştur
        const timeline = {
            videoSrc: 'brol-video.mp4',
            shortTitle: 'n8n-automation',
            totalDurationMs: totalDurationMs,
            segments: segments,
            endCard: {
                startMs: totalDurationMs - 3000,
                durationMs: 3000,
                title: "Yorumlara 'otomasyon' yaz! 👇",
                subtitle: "Detaylı YouTube videosu + Otomasyon şablonu"
            }
        };

        // Eski timeline'ı yedekle
        const backupPath = OUTPUT_PATH.replace('.json', '.backup.json');
        if (fs.existsSync(OUTPUT_PATH)) {
            fs.copyFileSync(OUTPUT_PATH, backupPath);
            console.log('📦 Eski timeline yedeklendi');
        }

        // Yeni timeline'ı kaydet
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(timeline, null, 2), 'utf-8');
        console.log(`✅ Timeline kaydedildi: ${OUTPUT_PATH}\n`);

        console.log('🎉 İşlem tamamlandı! Şimdi render alabilirsiniz:');
        console.log('   npx remotion render n8n-automation out/final.mp4\n');

    } catch (error) {
        console.error('❌ Whisper API hatası:', error.message);
        process.exit(1);
    }
}

main();
