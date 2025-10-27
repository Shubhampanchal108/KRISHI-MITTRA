// Test file: https://storage.googleapis.com/generativeai-downloads/data/16000.wav
const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');
const pkg = require('wavefile');  // npm install wavefile
const WaveFile = pkg.WaveFile;


const ai = new GoogleGenAI({
    apiKey: "AIzaSyB6ge5vHjsCkirRKi1j8voS7EpC0D6QXB4",
});
// WARNING: Do not use API keys in client-side (browser based) applications
// Consider using Ephemeral Tokens instead
// More information at: https://ai.google.dev/gemini-api/docs/ephemeral-tokens

// New native audio model:
const model = "gemini-2.5-flash-native-audio-preview-09-2025"

const config = {
  responseModalities: [Modality.AUDIO],
  systemInstruction: "You are a helpful assistant and answer in a friendly tone."
};

async function live() {
    const responseQueue = [];

    async function waitMessage() {
        let done = false;
        let message = undefined;
        while (!done) {
            message = responseQueue.shift();
            if (message) {
                done = true;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        return message;
    }

    async function handleTurn() {
        const turns = [];
        let done = false;
        while (!done) {
            const message = await waitMessage();
            turns.push(message);
            if (message.serverContent && message.serverContent.turnComplete) {
                done = true;
            }
        }
        return turns;
    }

    const session = await ai.live.connect({
        model: model,
        callbacks: {
            onopen: function () {
                console.debug('Opened');
            },
            onmessage: function (message) {
                responseQueue.push(message);
            },
            onerror: function (e) {
                console.debug('Error:', e.message);
            },
            onclose: function (e) {
                console.debug('Close:', e.reason);
            },
        },
        config: config,
    });

    // Send Audio Chunk
    const fileBuffer = fs.readFileSync("C:\\Users\\j\\OneDrive\\Desktop\\shubham studio\\KRISHI MITTRA\\Server\\LLM\\sample.wav");

    // Ensure audio conforms to API requirements (16-bit PCM, 16kHz, mono)
    const wav = new WaveFile();
    wav.fromBuffer(fileBuffer);
    wav.toSampleRate(16000);
    wav.toBitDepth("16");
    const base64Audio = wav.toBase64();

    // If already in correct format, you can use this:
    // const fileBuffer = fs.readFileSync("sample.pcm");
    // const base64Audio = Buffer.from(fileBuffer).toString('base64');

    session.sendRealtimeInput(
        {
            audio: {
                data: base64Audio,
                mimeType: "audio/pcm;rate=16000"
            }
        }

    );

    const turns = await handleTurn();

    // Combine audio data strings and save as wave file
    const combinedAudio = turns.reduce((acc, turn) => {
        if (turn.data) {
            const buffer = Buffer.from(turn.data, 'base64');
            const intArray = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
            return acc.concat(Array.from(intArray));
        }
        return acc;
    }, []);

    const audioBuffer = new Int16Array(combinedAudio);

    const wf = new WaveFile();
    wf.fromScratch(1, 24000, '16', audioBuffer);  // output is 24kHz
    fs.writeFileSync('audio.wav', wf.toBuffer());

    session.close();
}

async function main() {
    await live().catch((e) => console.error('got error', e));
}

main()