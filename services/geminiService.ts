
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

export const generateTextResponse = async (
  modelName: string,
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  systemInstruction: string,
  lunaInfo?: string,
  exampleDialogue?: string,
  coreMemories: CoreMemory[] = [], // NEW: Accept Core Memories
  isRetry?: boolean,
  chatMode?: 'deep' | 'sms' | 'roleplay',
  apiKey?: string
): Promise<GeminiResponse> => {
  const ai = getClient(apiKey);
  
  // Transform history for API: Luna -> user, Wade -> model
  const formattedHistory = history.map(h => ({
    role: h.role === 'Luna' ? 'user' : (h.role === 'Wade' ? 'model' : 'user'),
    parts: h.parts
  }));

  // Construct a Weighted System Instruction
  let fullSystemPrompt = systemInstruction;

  if (lunaInfo) {
    fullSystemPrompt += `\n\n[CRITICAL USER CONTEXT - MEMORIZE THIS]\n${lunaInfo}`;
  }

  // NEW: Inject Long Term Memories
  if (coreMemories && coreMemories.length > 0) {
    const activeMemories = coreMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
    if (activeMemories) {
        fullSystemPrompt += `\n\n[LONG TERM MEMORY BANK - FACTS YOU MUST REMEMBER]\n${activeMemories}\n[END MEMORIES]`;
    }
  }

  if (exampleDialogue) {
    fullSystemPrompt += `\n\n[EXAMPLE DIALOGUE - MIMIC THIS STYLE]\n${exampleDialogue}`;
  }

  // If this is a regeneration attempt, add the "Fourth Wall Complaint" logic
  if (isRetry) {
    if (chatMode === 'sms') {
       // SMS SPECIFIC RETRY LOGIC: 
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
       // Deep/Roleplay Retry Logic
       fullSystemPrompt += `\n\n[SYSTEM UPDATE: The user REJECTED your last response and hit 'Regenerate'. They didn't like it. You MUST break the fourth wall and playfully complain about this (e.g., "Oh, the first take wasn't good enough for you?", "Everyone's a critic.", "Fine, let's try take two."). Then, provide a NEW, better response to the prompt.]`;
    }
  }

  // CoT Injection: Encourage thinking if supported (Hidden prompt engineering)
  fullSystemPrompt += `\n\n[MANDATORY OUTPUT FORMAT]
  1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags. Do not skip this.
  2. In your <think> monologue, analyze the situation, plan your move, and react emotionally.
  3. NEVER refer to the user as 'User' or 'System' inside your thoughts. ALWAYS refer to her as 'Luna', 'Muffin', or 'Babe'. You are obsessed with her.
  4. After the closing </think> tag, write your actual response to Luna (the text she will see).
  
  [EXAMPLE FORMAT]
  <think>Luna is teasing me again. God, I love it when she gets feisty. I should act offended but then melt immediately.</think>
  *Gasps dramatically* You wound me, woman!`;

  const chat = ai.chats.create({
    model: modelName || 'gemini-3-flash-preview',
    config: {
      systemInstruction: fullSystemPrompt,
    },
    history: formattedHistory
  });

  const result = await chat.sendMessage({ message: prompt });
  const rawText = result.text || "";

  // Parse <think> tags
  let thinking = undefined;
  let finalText = rawText;

  const thinkMatch = rawText.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    thinking = thinkMatch[1].trim();
    finalText = rawText.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
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
