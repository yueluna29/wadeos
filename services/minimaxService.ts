function splitLongText(text: string, maxLength = 5000): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

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
  const chunks = splitLongText(text);  // 使用我们加的拆分函数

let firstBase64 = '';

// 用 Promise.all 并发处理所有段（避免栈溢出，同时更快）
const promises = chunks.map(async (chunkText) => {
  const response = await fetch('https://wadeos.vercel.app/api/minimax-tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: chunkText, config })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.audio) {
    throw new Error('No audio data returned from API');
  }

  const hexAudio = data.audio;
  const bytes = new Uint8Array(hexAudio.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
  return btoa(String.fromCharCode(...bytes));
});

try {
  const base64Audios = await Promise.all(promises);
  firstBase64 = base64Audios[0] || '';  // 先返回第一段
} catch (error) {
  console.error('Minimax TTS generation failed:', error);
  throw error;
}

return firstBase64;  // 返回第一段音频的 base64
} catch (error) {
  console.error('Minimax TTS generation failed:', error);
  throw error;
}
};

// WebSocket 版本的 TTS 函数（先只连上，不播声音，测试连接）
export const testMinimaxWebSocket = (apiKey: string) => {
  const ws = new WebSocket('wss://api.minimax.io/ws/v1/t2a_v2');

  ws.onopen = () => {
    console.log('WebSocket 连接成功！');
    ws.close();  // 先连上就关掉，测试用
  };

  ws.onerror = (err) => {
    console.error('WebSocket 连接失败：', err);
  };

  ws.onclose = () => {
    console.log('WebSocket 已关闭');
  };
};
