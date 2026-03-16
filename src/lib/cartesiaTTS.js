let audioCtx = null;
let currentGain = null;
let currentAbort = null;

function getAudioCtx() {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function stopSpeaking() {
  if (currentAbort) {
    currentAbort.abort();
    currentAbort = null;
  }
  if (currentGain) {
    currentGain.disconnect();
    currentGain = null;
  }
}

export async function speakWithCartesia(text) {
  const apiKey = import.meta.env.VITE_CARTESIA_API_KEY;
  const voiceId = import.meta.env.VITE_CARTESIA_VOICE_ID;

  stopSpeaking();

  const abortController = new AbortController();
  currentAbort = abortController;

  try {
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      signal: abortController.signal,
      headers: {
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        transcript: text,
        model_id: "sonic-english",
        voice: {
          mode: "id",
          id: voiceId,
        },
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
      }),
    });

    if (!response.ok) {
      console.error("Cartesia TTS error:", await response.text());
      return;
    }

    const ctx = getAudioCtx();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    currentGain = gainNode;

    const reader = response.body.getReader();
    let scheduledTime = ctx.currentTime;

    const scheduleChunk = (float32Data) => {
      // Slightly slower playback: lower source rate stretches audio ~5%
      const buffer = ctx.createBuffer(1, float32Data.length, 42000);
      buffer.getChannelData(0).set(float32Data);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);

      const startAt = Math.max(scheduledTime, ctx.currentTime);
      source.start(startAt);
      scheduledTime = startAt + buffer.duration;
    };

    let leftover = new Uint8Array(0);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const combined = new Uint8Array(leftover.length + value.length);
      combined.set(leftover);
      combined.set(value, leftover.length);

      const usable = combined.length - (combined.length % 4);
      if (usable > 0) {
        const float32Data = new Float32Array(combined.buffer, combined.byteOffset, usable / 4);
        scheduleChunk(float32Data);
      }
      leftover = combined.slice(usable);
    }

    if (leftover.length >= 4) {
      const usable = leftover.length - (leftover.length % 4);
      const float32Data = new Float32Array(leftover.buffer, leftover.byteOffset, usable / 4);
      scheduleChunk(float32Data);
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("Cartesia TTS failed:", err);
  }
}
