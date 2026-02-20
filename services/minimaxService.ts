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
  bitrate?: number;
  format?: string;
  channel?: number;
}

export const generateMinimaxTTS = async (
  text: string,
  config: MinimaxTTSConfig
): Promise<string> => {
  const {
    apiKey,
    baseUrl = 'https://api.minimax.io',
    model = 'speech-2.8-hd',
    voiceId = 'English_expressive_narrator',
    speed = 1,
    vol = 1,
    pitch = 0,
    emotion,
    sampleRate = 32000,
    bitrate = 128000,
    format = 'mp3',
    channel = 1
  } = config;

  const requestBody = {
    model,
    text,
    stream: false,
    voice_setting: {
      voice_id: voiceId,
      speed,
      vol,
      pitch,
      ...(emotion && { emotion })
    },
    audio_setting: {
      sample_rate: sampleRate,
      bitrate,
      format,
      channel
    },
    output_format: 'hex'
  };

  try {
    const response = await fetch(`${baseUrl}/v1/t2a_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Minimax TTS Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.base_resp?.status_code !== 0) {
      throw new Error(`Minimax API Error: ${data.base_resp?.status_msg || 'Unknown error'}`);
    }

    if (!data.data?.audio) {
      throw new Error('No audio data returned from Minimax API');
    }

    const hexAudio = data.data.audio;
    const bytes = new Uint8Array(hexAudio.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
    const base64Audio = btoa(String.fromCharCode(...bytes));

    return base64Audio;
  } catch (error) {
    console.error('Minimax TTS generation failed:', error);
    throw error;
  }
};
