/**
 * OpenAI Whisper API ile cümle bazlı segmentasyon
 * Cümle sonlarına göre doğal kesim noktaları oluşturur
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VIDEO_PATH = path.join(__dirname, '../public/brol-video.mp4');
const OUTPUT_PATH = path.join(__dirname, '../public/content/n8n-automation/sentence-segments.json');

// B-Roll kaynakları
const BROLL_SOURCES = [
    'content/n8n-automation/broll/ai-robot.mp4',
    'content/n8n-automation/broll/phone-call.mp4',
    'content/n8n-automation/broll/money-saving.mp4',
    'content/n8n-automation/broll/office-stress.mp4',
    'content/n8n-automation/broll/success.mp4',
    'content/n8n-automation/broll/workflow.mp4',
    'content/n8n-automation/broll/youtube-cta.mp4',
];

async function transcribeWithWhisper() {
    console.log('🎤 Whisper API ile CÜMLE BAZLI transkript alınıyor...\n');

    const form = new FormData();
    form.append('file', fs.createReadStream(VIDEO_PATH));
    form.append('model', 'whisper-1');
    form.append('language', 'tr');
    form.append('response_format', 'verbose_json');
    // Hem segment hem word granularity iste
    form.append('timestamp_granularities[]', 'segment');
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
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        form.pipe(req);
    });
}

function createSegmentsFromSentences(whisperResult) {
    const sentences = whisperResult.segments || [];

    console.log(`📝 Whisper'dan ${sentences.length} cümle alındı:\n`);
    sentences.forEach((s, i) => {
        console.log(`   ${i + 1}. [${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] "${s.text.trim()}"`);
    });
    console.log('');

    // Her 1-2 cümle = 1 segment (toplamda 5-7 segment hedefi)
    const targetSegmentCount = Math.min(7, Math.max(5, Math.ceil(sentences.length / 2)));
    const sentencesPerSegment = Math.ceil(sentences.length / targetSegmentCount);

    const segments = [];

    for (let i = 0; i < sentences.length; i += sentencesPerSegment) {
        const segmentSentences = sentences.slice(i, Math.min(i + sentencesPerSegment, sentences.length));

        if (segmentSentences.length === 0) continue;

        const segmentId = segments.length + 1;
        const startMs = Math.floor(segmentSentences[0].start * 1000);
        const endMs = Math.floor(segmentSentences[segmentSentences.length - 1].end * 1000);
        const text = segmentSentences.map(s => s.text.trim()).join(' ');

        // Segment adı oluştur (ilk birkaç kelimeden)
        const name = text.split(' ').slice(0, 3).join('-').toLowerCase()
            .replace(/[^a-z0-9-]/g, '').substring(0, 20);

        segments.push({
            id: segmentId,
            name: name || `segment-${segmentId}`,
            startMs,
            endMs,
            durationMs: endMs - startMs,
            text: text,
            sentences: segmentSentences.map(s => ({
                startMs: Math.floor(s.start * 1000),
                endMs: Math.floor(s.end * 1000),
                text: s.text.trim()
            })),
            brollSrc: BROLL_SOURCES[(segmentId - 1) % BROLL_SOURCES.length]
        });
    }

    return segments;
}

async function main() {
    console.log('🚀 Cümle Bazlı Segmentasyon Başlıyor...\n');

    if (!OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY bulunamadı!');
        process.exit(1);
    }

    try {
        const whisperResult = await transcribeWithWhisper();

        console.log('✅ Whisper tamamlandı!');
        console.log(`⏱️ Toplam süre: ${whisperResult.duration?.toFixed(2)} saniye\n`);

        // Cümle bazlı segment oluştur
        const segments = createSegmentsFromSentences(whisperResult);

        console.log(`\n📊 ${segments.length} CÜMLE BAZLI segment oluşturuldu:\n`);
        segments.forEach(s => {
            console.log(`   Segment ${s.id}: ${(s.startMs / 1000).toFixed(1)}s - ${(s.endMs / 1000).toFixed(1)}s (${(s.durationMs / 1000).toFixed(1)}s)`);
            console.log(`   "${s.text.substring(0, 60)}..."\n`);
        });

        // Kaydet
        const output = {
            totalDurationMs: Math.floor(whisperResult.duration * 1000),
            segments: segments,
            rawWhisperSegments: whisperResult.segments
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
        console.log(`✅ Kaydedildi: ${OUTPUT_PATH}`);
        console.log('\n📌 Şimdi bu dosyayı inceleyip kesim noktalarını onaylayabilirsiniz.');
        console.log('   Onayladıktan sonra videoyu bu noktalara göre keseceğim.');

    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

main();
