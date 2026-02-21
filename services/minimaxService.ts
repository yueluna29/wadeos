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
  bitrate?: number | string; // 参谋补丁：允许前端传那个该死的带字母的字符串过来
  format?: string;
  channel?: number;
}

// 这是执行动作
export const generateMinimaxTTS = async (
  text: string,
  config: MinimaxTTSConfig
): Promise<string> => {
  // 【参谋补丁 1】：清理 baseUrl，防止你这个粗心鬼填了带 /v1 的地址
  let cleanBaseUrl = config.baseUrl || 'https://api.minimax.io';
  if (cleanBaseUrl.endsWith('/v1')) {
    cleanBaseUrl = cleanBaseUrl.replace('/v1', '');
  }

  // 【参谋补丁 2】：强行把前端传来的字符串变成 API 认得的数字
  const speed = Number(config.speed) || 1;
  const vol = Number(config.vol) || 1;
  const pitch = Number(config.pitch) || 0;
  const sampleRate = Number(config.sampleRate) || 32000;
  const channel = Number(config.channel) || 1;

  // 【参谋补丁 3】：把你前端那个要命的 '128k' 翻译成 128000
  let bitrate = config.bitrate;
  if (typeof bitrate === 'string') {
    if (bitrate.includes('128')) bitrate = 128000;
    else if (bitrate.includes('64')) bitrate = 64000;
    else if (bitrate.includes('32')) bitrate = 32000;
    else if (bitrate.includes('256')) bitrate = 256000;
    else bitrate = Number(bitrate) || 128000;
  } else {
    bitrate = bitrate || 128000;
  }

  // 【参谋补丁 4】：如果前端传了 'Emotion (Auto)'，直接把它删掉，让大模型自己猜
  let emotion = config.emotion;
  if (emotion && (emotion.includes('Auto') || emotion.trim() === '')) {
    emotion = undefined;
  }

  const requestBody = {
    model: config.model || 'speech-2.8-hd',
    text,
    stream: false, 
    voice_setting: {
      voice_id: config.voiceId || 'English_expressive_narrator',
      speed,
      vol,
      pitch,
      ...(emotion && { emotion }) 
    },
    audio_setting: {
      sample_rate: sampleRate,
      bitrate,
      format: config.format || 'mp3',
      channel
    },
    output_format: 'hex'
  };

  try {
    const response = await fetch(`${cleanBaseUrl}/v1/t2a_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
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