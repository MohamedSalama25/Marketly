// NOTE: Ideally these should be in environment variables
const VOICE_API_KEY = 'sk_257765039d8ca981e3b93bd7000c795d327e7ea7df7e55f1';
const VOICE_ID_ADAM = 'pNInz6obpgDQGcFmaJgB';

export async function playVoice(text, locale = 'ar') {
    try {
        const voiceId = VOICE_ID_ADAM;
        const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': VOICE_API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.blob();
        if (data) {
            const url = URL.createObjectURL(data);
            const audio = new Audio(url);
            audio.play().catch(e => console.error("Auto-play failed:", e));
            return audio;
        }
        throw new Error('No audio data');
    } catch (error) {
        console.error('ElevenLabs API error, falling back to browser TTS:', error);
        return speakWithBrowser(text, locale);
    }
}

function speakWithBrowser(text, locale) {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            resolve(null);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale === 'ar' ? 'ar-SA' : 'en-US';

        // Try to find a good voice for the locale
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(locale));
        if (voice) utterance.voice = voice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
        resolve(null);
    });
}
