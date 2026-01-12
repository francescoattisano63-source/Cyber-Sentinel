
export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function resample(data: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return data;
  const ratio = toRate / fromRate;
  const newLength = Math.round(data.length * ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i / ratio;
    const low = Math.floor(srcIndex);
    const high = Math.min(low + 1, data.length - 1);
    const t = srcIndex - low;
    result[i] = data[low] * (1 - t) + data[high] * t;
  }
  return result;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array, currentRate: number): { data: string; mimeType: string } {
  // Resample a 16000Hz prima di convertire in Int16
  const resampled = resample(data, currentRate, 16000);
  const l = resampled.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, resampled[i]));
    int16[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return {
    data: encodeAudio(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
