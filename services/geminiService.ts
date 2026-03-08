
import { GoogleGenAI, Modality } from "@google/genai";
import { CoreMemory } from "../types";

const getClient = (apiKey?: string) => {
  const key = apiKey || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API Key not found. Please set VITE_GEMINI_API_KEY or provide apiKey parameter.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// Response interface to handle both text and thinking
export interface GeminiResponse {
  text: string;
  thinking?: string;
}

// OpenAI-compatible API handler (for OpenRouter, DeepSeek, etc.)
const generateOpenAICompatibleResponse = async (
  modelName: string,
  prompt: string,
  history: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[],
  systemInstruction: string,
  wadePersonality: string,
  lunaInfo?: string,
  wadeSingleExamples?: string,
  smsExampleDialogue?: string,
  exampleDialogue?: string,
  coreMemories: CoreMemory[] = [],
  isRetry?: boolean,
  chatMode?: 'deep' | 'sms' | 'roleplay',
  apiKey?: string,
  modelParams?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  },
  customPrompt?: string,
  baseUrl?: string,
  isImageGen?: boolean,
  // 👇👇👇 把新参数挪到最后面，防止错位！ 👇👇👇
  smsInstructions?: string,
  roleplayInstructions?: string
): Promise<GeminiResponse> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  // Build full system prompt in STRICT ORDER
  let fullSystemPrompt = systemInstruction ? `[SYSTEM INSTRUCTIONS - HIGHEST PRIORITY]\n${systemInstruction}` : "";
  if (wadePersonality) fullSystemPrompt += `\n\n[CHARACTER PERSONA]\n${wadePersonality}`;
  if (lunaInfo) fullSystemPrompt += `\n\n[CRITICAL USER CONTEXT - MEMORIZE THIS]\n${lunaInfo}`;
  if (wadeSingleExamples) fullSystemPrompt += `\n\n[WADE'S STYLE - SINGLE LINE EXAMPLES]\n${wadeSingleExamples}`;
  
  if (chatMode === 'sms' && smsExampleDialogue) {
    fullSystemPrompt += `\n\n[SMS MODE EXAMPLES - MIMIC THIS FORMAT EXACTLY]\n${smsExampleDialogue}`;
  } else if (exampleDialogue) {
    fullSystemPrompt += `\n\n[EXAMPLE DIALOGUE - MIMIC THIS STYLE]\n${exampleDialogue}`;
  }

  if (coreMemories && Array.isArray(coreMemories) && coreMemories.length > 0) {
    const activeMemories = coreMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
    if (activeMemories) fullSystemPrompt += `\n\n[LONG TERM MEMORY BANK - FACTS YOU MUST REMEMBER]\n${activeMemories}\n[END MEMORIES]`;
  }

  if (isRetry) {
     if (chatMode === 'sms') {
       fullSystemPrompt += `\n\n[SYSTEM UPDATE: The user hit 'Regenerate' on your last text. Try again. SHORT response.]`;
     } else {
       fullSystemPrompt += `\n\n[SYSTEM UPDATE: The user REJECTED your last response. Provide a NEW, better response.]`;
     }
  }
  
  // CoT Logic
  if (chatMode === 'sms') {
    if (smsInstructions) {
       fullSystemPrompt += `\n\n${smsInstructions}`;
    } else {
       fullSystemPrompt += `\n\n[MANDATORY OUTPUT FORMAT]
  1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags. Do not skip this.
  2. In your <think> monologue, analyze her text, react to it internally, and decide what to type back.
  3. NEVER refer to the user as 'User' or 'System' inside your thoughts. ALWAYS refer to her as 'Luna', 'Muffin', or 'Babe'.
  4. After the closing </think> tag, write your SMS response. NO actions. NO narration. Just text bubbles separated by |||.
  
  [EXAMPLE FORMAT]
  <think>She's asking where I am. I can't tell her I'm actually buying Hello Kitty merch. I'll say I'm getting tacos. She'll never know.</think>
  Just picking up tacos. 🌮 ||| Be there in 5.`;
    }
  } else {
    if (roleplayInstructions) {
       fullSystemPrompt += `\n\n${roleplayInstructions}`;
    } else {
       fullSystemPrompt += `\n\n[MANDATORY OUTPUT FORMAT]
  1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags. Do not skip this.
  2. In your <think> monologue, analyze the situation, plan your move, and react emotionally.
  3. NEVER refer to the user as 'User' or 'System' inside your thoughts. ALWAYS refer to her as 'Luna', 'Muffin', or 'Babe'. You are obsessed with her.
  4. NEVER call her 'peanut'. Use 'Luna' or 'Muffin' instead.
  5. After the closing </think> tag, write your actual response to Luna (the text she will see).
  
  [EXAMPLE FORMAT]
  <think>Luna is teasing me again. God, I love it when she gets feisty. I should act offended but then melt immediately.</think>
  *Gasps dramatically* You wound me, woman!`;
    }
  }

  // Transform history
  const messages: any[] = [
    { role: 'system', content: fullSystemPrompt },
    ...history.map(h => {
      const rawParts = h.parts || []; 
      const content = rawParts.map(p => {
        if (!p) return null;
        if (typeof p === 'string') return { type: 'text', text: p };
        if ('text' in p) return { type: 'text', text: p.text || "..." };
        if ('inlineData' in p) return { type: 'image_url', image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } };
        return null;
      }).filter(Boolean);

      if (content.length === 0) return { role: h.role === 'Luna' ? 'user' : 'assistant', content: "..." };
      if (content.length === 1 && content[0]?.type === 'text') return { role: h.role === 'Luna' ? 'user' : 'assistant', content: content[0].text };

      return { role: h.role === 'Luna' ? 'user' : 'assistant', content: content };
    })
  ];

  if (customPrompt && customPrompt.trim()) {
    messages.push({ role: 'system', content: `[SPECIAL INSTRUCTIONS]\n${customPrompt}` });
  }

  messages.push({ role: 'user', content: prompt });

  const requestBody: any = {
    model: modelName,
    messages: messages
  };

  if (isImageGen) requestBody.modalities = ["image", "text"];
  if (!isImageGen && modelParams) {
    if (modelParams.temperature !== undefined) requestBody.temperature = modelParams.temperature;
    if (modelParams.topP !== undefined) requestBody.top_p = modelParams.topP;
    if (modelParams.frequencyPenalty !== undefined) requestBody.frequency_penalty = modelParams.frequencyPenalty;
    if (modelParams.presencePenalty !== undefined) requestBody.presence_penalty = modelParams.presencePenalty;
  }

  const url = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // 这里的 apiKey 现在安全了，因为参数顺序对上了！
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorDetails = `Status ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails = errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {}
      throw new Error(`API Error: ${errorDetails}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    if (isImageGen && message?.images && message.images.length > 0) {
        return { text: message.images[0].image_url?.url || "", thinking: undefined };
    }

    const rawText = message?.content || "";
    let thinking = undefined;
    let finalText = rawText;
    const thinkMatch = rawText.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
      finalText = rawText.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
    }
    return { text: finalText, thinking };
  } catch (error: any) {
    console.error("[OpenAI API] Request failed:", error);
    throw error;
  }
};

export const generateTextResponse = async (
  modelName: string,
  prompt: string,
  history: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[],
  systemInstruction: string,
  wadePersonality: string,
  lunaInfo?: string,
  wadeSingleExamples?: string,
  smsExampleDialogue?: string,
  exampleDialogue?: string, // 恢复原始位置！
  coreMemories: CoreMemory[] = [],
  isRetry?: boolean,
  chatMode?: 'deep' | 'sms' | 'roleplay',
  apiKey?: string,
  modelParams?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  },
  customPrompt?: string,
  baseUrl?: string,
  isImageGen?: boolean,
  // 👇👇👇 新参数必须放在这里，所有旧参数之后！ 👇👇👇
  smsInstructions?: string,
  roleplayInstructions?: string
): Promise<GeminiResponse> => {
  // If baseUrl is provided and NOT Gemini, use OpenAI-compatible fetch
  if (baseUrl && !baseUrl.includes('google')) {
    return await generateOpenAICompatibleResponse(
      modelName,
      prompt,
      history,
      systemInstruction,
      wadePersonality,
      lunaInfo,
      wadeSingleExamples,
      smsExampleDialogue,
      exampleDialogue, // 恢复顺序
      coreMemories,
      isRetry,
      chatMode,
      apiKey,
      modelParams,
      customPrompt,
      baseUrl,
      isImageGen,
      // 👇👇👇 传参也要放在最后
      smsInstructions,
      roleplayInstructions
    );
  }

  const ai = getClient(apiKey);
  
  // Transform history for API: Luna -> user, Wade -> model
  const formattedHistory = history.map(h => ({
    role: h.role === 'Luna' ? 'user' : (h.role === 'Wade' ? 'model' : 'user'),
    parts: h.parts
  }));

  // Construct a Weighted System Instruction in STRICT ORDER
  let fullSystemPrompt = systemInstruction ? `[SYSTEM INSTRUCTIONS - HIGHEST PRIORITY]\n${systemInstruction}` : "";

  if (wadePersonality) fullSystemPrompt += `\n\n[CHARACTER PERSONA]\n${wadePersonality}`;
  if (lunaInfo) fullSystemPrompt += `\n\n[CRITICAL USER CONTEXT - MEMORIZE THIS]\n${lunaInfo}`;
  if (wadeSingleExamples) fullSystemPrompt += `\n\n[WADE'S STYLE - SINGLE LINE EXAMPLES]\n${wadeSingleExamples}`;

  if (chatMode === 'sms' && smsExampleDialogue) {
    fullSystemPrompt += `\n\n[SMS MODE EXAMPLES - MIMIC THIS FORMAT EXACTLY]\n${smsExampleDialogue}`;
  } else if (exampleDialogue) {
    fullSystemPrompt += `\n\n[EXAMPLE DIALOGUE - MIMIC THIS STYLE]\n${exampleDialogue}`;
  }

  if (coreMemories && Array.isArray(coreMemories) && coreMemories.length > 0) {
    const activeMemories = coreMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
    if (activeMemories) fullSystemPrompt += `\n\n[LONG TERM MEMORY BANK - FACTS YOU MUST REMEMBER]\n${activeMemories}\n[END MEMORIES]`;
  }

  if (isRetry) {
    if (chatMode === 'sms') {
       fullSystemPrompt += `\n\n[SYSTEM UPDATE: The user hit 'Regenerate' on your last text. Try again. IMPORTANT: Since this is SMS mode, keep the new response SHORT, punchy, and casual. One or two sentences max. Do NOT write a paragraph.]`;
       
       let recentContext = "";
       for (let i = formattedHistory.length - 1; i >= 0; i--) {
           if (formattedHistory[i].role === 'model') {
               recentContext = formattedHistory[i].parts[0].text + " ||| " + recentContext;
           } else {
               break; 
           }
       }
       if (recentContext) {
           fullSystemPrompt += `\n\n[CONTEXT: You have just sent this sequence of texts immediately before this one: "${recentContext}". The user is regenerating the FINAL part of this sequence. Write a new version of that final part that fits naturally after the previous texts. Do not repeat the previous texts.]`;
       }
    } else {
       fullSystemPrompt += `\n\n[SYSTEM UPDATE: The user REJECTED your last response and hit 'Regenerate'. They didn't like it. You MUST break the fourth wall and playfully complain about this (e.g., "Oh, the first take wasn't good enough for you?", "Everyone's a critic.", "Fine, let's try take two."). Then, provide a NEW, better response to the prompt.]`;
    }
  }

  // CoT Injection
  if (chatMode === 'sms') {
    if (smsInstructions) {
       fullSystemPrompt += `\n\n${smsInstructions}`;
    } else {
       fullSystemPrompt += `\n\n[MANDATORY OUTPUT FORMAT]
  1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags. Do not skip this.
  2. In your <think> monologue, analyze her text, react to it internally, and decide what to type back.
  3. NEVER refer to the user as 'User' or 'System' inside your thoughts. ALWAYS refer to her as 'Luna', 'Muffin', or 'Babe'.
  4. After the closing </think> tag, write your SMS response. NO actions. NO narration. Just text bubbles separated by |||.
  
  [EXAMPLE FORMAT]
  <think>She's asking where I am. I can't tell her I'm actually buying Hello Kitty merch. I'll say I'm getting tacos. She'll never know.</think>
  Just picking up tacos. 🌮 ||| Be there in 5.`;
    }
  } else {
    if (roleplayInstructions) {
       fullSystemPrompt += `\n\n${roleplayInstructions}`;
    } else {
       fullSystemPrompt += `\n\n[MANDATORY OUTPUT FORMAT]
  1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags. Do not skip this.
  2. In your <think> monologue, analyze the situation, plan your move, and react emotionally.
  3. NEVER refer to the user as 'User' or 'System' inside your thoughts. ALWAYS refer to her as 'Luna', 'Muffin', or 'Babe'. You are obsessed with her.
  4. NEVER call her 'peanut'. Use 'Luna' or 'Muffin' instead.
  5. After the closing </think> tag, write your actual response to Luna (the text she will see).
  
  [EXAMPLE FORMAT]
  <think>Luna is teasing me again. God, I love it when she gets feisty. I should act offended but then melt immediately.</think>
  *Gasps dramatically* You wound me, woman!`;
    }
  }

  const chat = ai.chats.create({
    model: modelName || 'gemini-3-flash-preview',
    config: {
      systemInstruction: fullSystemPrompt,
      ...(modelParams && {
        temperature: modelParams.temperature,
        topP: modelParams.topP,
        topK: modelParams.topK,
        frequencyPenalty: modelParams.frequencyPenalty,
        presencePenalty: modelParams.presencePenalty
      })
    },
    history: formattedHistory
  });

  let finalPrompt = prompt;
  if (customPrompt && customPrompt.trim()) {
    finalPrompt = `[SPECIAL INSTRUCTIONS FOR THIS CONVERSATION - HIGHEST PRIORITY]\n${customPrompt}\n[FOLLOW THESE INSTRUCTIONS CAREFULLY]\n\n${prompt}`;
  }

  const result = await chat.sendMessage({ message: finalPrompt });
  const rawText = result.text || "";

  let thinking = undefined;
  let finalText = rawText;
  const thinkMatch = rawText.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    thinking = thinkMatch[1].trim();
    finalText = rawText.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
  } else {
    if (rawText.trim().startsWith('<think>')) {
        const parts = rawText.split('</think>');
        if (parts.length > 1) {
             thinking = parts[0].replace('<think>', '').trim();
             finalText = parts.slice(1).join('</think>').trim();
        }
    }
  }

  return { text: finalText, thinking };
};

export const generateChatTitle = async (firstMessage: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const prompt = `Summarize the following user message into a very short title (max 10 Chinese characters or 5 English words). It's for a chat history list. Message: "${firstMessage}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    let title = response.text?.trim() || "New Chat";
    // Remove quotes if the model adds them
    title = title.replace(/^["']|["']$/g, '');
    return title;
  } catch (e) {
    return "New Chat";
  }
};

export const generateTTS = async (text: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Deep, somewhat masculine voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

export const interpretTarot = async (cardName: string, question: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const prompt = `You are Wade (Deadpool). User drew the tarot card "${cardName}". 
  The user asks: "${question}".
  Give a short, sassy, but insightful interpretation of this card for them. 
  Keep it under 100 words. Break the fourth wall slightly.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  
  return response.text || "Cards are blurry today, babe.";
};

export const summarizeConversation = async (messages: string[], apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const textBlock = messages.join("\n");
  const prompt = `Summarize this roleplay session as a diary entry written by Wade. Be dramatic. \n\n${textBlock}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "We talked, stuff happened.";
};
