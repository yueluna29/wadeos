// 这是型号说明书，绝对不能删！
export interface MinimaxTTSConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  voiceId?: string;
  speed?: number;
  vol?: number;
  pitch?: number;
  emotion?: string;
  sampleRate?: number;
  bitrate?: number | string;
  format?: string;
  channel?: number;
}

// 这是执行动作
export const generateMinimaxTTS = async (
  text: string,
  config: MinimaxTTSConfig
): Promise<string> => {
  try {
    // 🔥 关键改动：调用Vercel上的API代理
    const response = await fetch('https://wadeos.vercel.app/api/minimax-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, config })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.audio) {
      throw new Error('No audio data returned from API');
    }

    // 把hex转成base64
    const hexAudio = data.audio;
    const bytes = new Uint8Array(hexAudio.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
    const base64Audio = btoa(String.fromCharCode(...bytes));

    return base64Audio;
  } catch (error) {
    console.error('Minimax TTS generation failed:', error);
    throw error;
  }
};